"use server";

/**
 * Cloudflare R2 — server-side image/document upload actions.
 *
 * Architecture:
 *   generateR2PresignedUrl() creates a short-lived presigned PUT URL.
 *   The browser uploads directly to R2 (no buffering through our server).
 *   Progress comes from XHR onprogress in the browser.
 *   On completion the browser has the final public URL to store.
 *
 * Required env vars:
 *   R2_ACCOUNT_ID        — Cloudflare account ID
 *   R2_ACCESS_KEY_ID     — R2 API token access key
 *   R2_SECRET_ACCESS_KEY — R2 API token secret
 *   R2_BUCKET_NAME       — bucket name
 *   R2_PUBLIC_URL        — public CDN URL, e.g. https://cdn.codepath.dev
 *
 * Signing uses AWS Signature V4 (R2 is S3-compatible).
 */

import { createHmac, createHash } from "crypto";
import { r2Key, guessContentType } from "./utils";

const ACCOUNT_ID   = process.env.R2_ACCOUNT_ID!;
const ACCESS_KEY   = process.env.R2_ACCESS_KEY_ID!;
const SECRET_KEY   = process.env.R2_SECRET_ACCESS_KEY!;
const BUCKET       = process.env.R2_BUCKET_NAME ?? "codepath-media";
const PUBLIC_URL   = process.env.R2_PUBLIC_URL   ?? "https://cdn.codepath.dev";

const R2_ENDPOINT  = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const SERVICE      = "s3";
const REGION       = "auto";

// ─── AWS SigV4 helpers ────────────────────────────────────────────────────────

function hmac(key: string | Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function sha256hex(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

function getSigningKey(dateStamp: string): Buffer {
  const kDate    = hmac("AWS4" + SECRET_KEY, dateStamp);
  const kRegion  = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

export interface PresignResult {
  uploadUrl:  string;   // PUT to this URL from browser
  publicUrl:  string;   // final URL to store in DB / display
  key:        string;   // object key in the bucket
}

/**
 * Generate a 15-minute presigned PUT URL for a given key.
 *
 * @param key         Object key, e.g. "courses/thumbnails/abc123.jpg"
 * @param contentType MIME type, e.g. "image/jpeg"
 */
export async function generateR2PresignedUrl(
  key: string,
  contentType: string
): Promise<PresignResult> {
  if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
    throw new Error("Cloudflare R2 is not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY missing)");
  }

  const now        = new Date();
  const dateStamp  = now.toISOString().slice(0, 10).replace(/-/g, "");   // YYYYMMDD
  const amzDate    = now.toISOString().replace(/[:-]|\.\d{3}/g, "");      // ISO without punctuation
  const expSeconds = 900; // 15 minutes

  const host     = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const endpoint = `${R2_ENDPOINT}/${BUCKET}/${key}`;

  const credScope   = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const credential  = `${ACCESS_KEY}/${credScope}`;

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm":     "AWS4-HMAC-SHA256",
    "X-Amz-Credential":    credential,
    "X-Amz-Date":          amzDate,
    "X-Amz-Expires":       String(expSeconds),
    "X-Amz-SignedHeaders": "host",
  });

  const canonicalQuery  = queryParams.toString();
  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders    = "host";
  const payloadHash      = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    `/${BUCKET}/${key}`,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credScope,
    sha256hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(dateStamp);
  const signature  = hmac(signingKey, stringToSign).toString("hex");

  const signedUrl  = `${endpoint}?${canonicalQuery}&X-Amz-Signature=${signature}`;

  return {
    uploadUrl: signedUrl,
    publicUrl: `${PUBLIC_URL}/${key}`,
    key,
  };
}

/**
 * Get a presigned upload URL for a course thumbnail.
 */
export async function getThumbnailUploadUrl(filename: string): Promise<PresignResult> {
  const key = r2Key("courses/thumbnails", filename);
  return generateR2PresignedUrl(key, guessContentType(filename));
}

/**
 * Get a presigned upload URL for a course resource/document.
 */
export async function getDocumentUploadUrl(
  courseId: string,
  lessonId: string,
  filename: string
): Promise<PresignResult> {
  const key = r2Key(`courses/${courseId}/resources/${lessonId}`, filename);
  return generateR2PresignedUrl(key, guessContentType(filename));
}
