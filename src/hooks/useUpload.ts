"use client";

/**
 * useUpload — browser-side upload helpers with real progress.
 *
 * uploadToR2()    — presigned PUT to Cloudflare R2 via XHR
 * uploadToBunny() — presigned TUS upload to Bunny Stream via tus-js-client
 */

import * as tus from "tus-js-client";

// ─── R2 ───────────────────────────────────────────────────────────────────────

export interface UploadOptions {
  onProgress?: (pct: number) => void;
  onError?:    (msg: string) => void;
}

export function uploadToR2(
  presignedUrl: string,
  file: File,
  contentType: string,
  opts: UploadOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        opts.onProgress?.(100);
        resolve();
      } else {
        const msg = `R2 upload failed: HTTP ${xhr.status}`;
        opts.onError?.(msg);
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => {
      const msg = "R2 upload failed: network error";
      opts.onError?.(msg);
      reject(new Error(msg));
    };
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}

// ─── Bunny TUS ────────────────────────────────────────────────────────────────

export interface BunnyUploadOptions extends UploadOptions {
  videoId:    string;
  libraryId:  string;
  signature:  string;   // SHA256 presigned signature from server
  expiration: number;   // UNIX timestamp (seconds)
  title:      string;
  // apiKey is intentionally omitted — never in browser
}

/**
 * Upload a video to Bunny Stream using the official tus-js-client.
 * Credentials are presigned server-side — API key never reaches the browser.
 *
 * Bunny TUS headers:
 *   AuthorizationSignature : SHA256(libraryId + apiKey + expiration + videoId)
 *   AuthorizationExpire    : unix timestamp seconds
 *   VideoId                : video GUID
 *   LibraryId              : library ID
 */
export function uploadToBunny(
  file: File,
  opts: BunnyUploadOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Auth headers that must be sent on EVERY request (POST creation + all PATCH chunks)
    const authHeaders = {
      AuthorizationSignature: opts.signature,
      AuthorizationExpire:    String(opts.expiration),
      VideoId:                opts.videoId,
      LibraryId:              String(opts.libraryId),
    };

    const upload = new tus.Upload(file, {
      endpoint:    "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize:   5 * 1024 * 1024,

      // onBeforeRequest fires before every request in tus-js-client v4.
      // Use req.setHeader() — NOT getUnderlyingObject() — which is the v4 API.
      onBeforeRequest(req) {
        req.setHeader("AuthorizationSignature", authHeaders.AuthorizationSignature);
        req.setHeader("AuthorizationExpire",    authHeaders.AuthorizationExpire);
        req.setHeader("VideoId",               authHeaders.VideoId);
        req.setHeader("LibraryId",             authHeaders.LibraryId);
      },

      metadata: {
        filetype: file.type || "video/mp4",
        title:    opts.title,
      },

      onProgress(bytesUploaded, bytesTotal) {
        opts.onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess() {
        opts.onProgress?.(100);
        resolve();
      },
      onError(error) {
        const detail = error instanceof Error ? error.message : String(error);
        const msg = `Bunny upload failed: ${detail}`;
        opts.onError?.(msg);
        reject(new Error(msg));
      },
    });

    upload.findPreviousUploads().then((prev) => {
      if (prev.length > 0) upload.resumeFromPreviousUpload(prev[0]);
      upload.start();
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
