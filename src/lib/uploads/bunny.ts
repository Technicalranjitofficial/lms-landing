"use server";

/**
 * Bunny Stream — server-side upload actions.
 *
 * TUS Upload Architecture (Bunny presigned approach):
 *   1. createBunnyVideo() — create video object, return videoId + presigned credentials
 *   2. Browser uses tus-js-client with those credentials to upload directly to Bunny CDN
 *   3. API key never leaves the server
 *
 * Signature formula: SHA256(libraryId + apiKey + expirationTime + videoId)
 * Headers required by Bunny TUS endpoint:
 *   - AuthorizationSignature : hex SHA256 signature
 *   - AuthorizationExpire    : unix timestamp (seconds)
 *   - VideoId                : video GUID
 *   - LibraryId              : library ID (string)
 */

import { createHash } from "crypto";

const BUNNY_API_KEY    = process.env.BUNNY_API_KEY!;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;
const BUNNY_API_BASE   = "https://video.bunnycdn.com/library";
const TUS_ENDPOINT     = "https://video.bunnycdn.com/tusupload";

export interface BunnyCreateResult {
  videoId:    string;   // GUID to store in DB
  tusUrl:     string;   // TUS endpoint URL
  signature:  string;   // SHA256 presigned signature (hex)
  expiration: number;   // UNIX timestamp (seconds)
  libraryId:  string;   // library ID string
}

/**
 * Create a video shell in Bunny and generate presigned TUS credentials.
 * Returns everything the browser needs to upload directly — no API key exposed.
 */
export async function createBunnyVideo(title: string): Promise<BunnyCreateResult> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream is not configured — set BUNNY_API_KEY and BUNNY_LIBRARY_ID");
  }

  // 1. Create video object in the library
  const createRes = await fetch(
    `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos`,
    {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "AccessKey":    BUNNY_API_KEY,
      },
      body: JSON.stringify({ title }),
    }
  );

  if (!createRes.ok) {
    const body = await createRes.json().catch(() => ({}));
    throw new Error(body.Message ?? `Bunny create video failed: ${createRes.status}`);
  }

  const video = await createRes.json() as { guid: string };
  const videoId = video.guid;

  if (!videoId) {
    throw new Error("Bunny returned no video GUID — check your API key and library ID");
  }

  // 2. Generate presigned signature server-side
  //    Formula: SHA256(libraryId + apiKey + expirationTime + videoId)
  //    Expiration: 6 hours from now (gives enough time for large uploads)
  const expiration = Math.floor(Date.now() / 1000) + 21600;

  const signature = createHash("sha256")
    .update(BUNNY_LIBRARY_ID + BUNNY_API_KEY + String(expiration) + videoId)
    .digest("hex");

  return {
    videoId,
    tusUrl:    TUS_ENDPOINT,
    signature,
    expiration,
    libraryId: BUNNY_LIBRARY_ID,
  };
}

/**
 * Delete a video from Bunny (called when user removes/replaces a lesson video).
 */
export async function deleteBunnyVideo(videoId: string): Promise<void> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) return;

  await fetch(
    `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      method:  "DELETE",
      headers: { "AccessKey": BUNNY_API_KEY },
    }
  ).catch(() => {}); // fire-and-forget
}

/**
 * Poll video encoding status.
 * Status codes: 0=Queued 1=Processing 2=Encoding 3=Finished 4=Resolution 5=Failed
 */
export async function getBunnyVideoStatus(videoId: string): Promise<{
  status: number;
  encodeProgress: number;
  storageSize: number;
}> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    return { status: 0, encodeProgress: 0, storageSize: 0 };
  }

  const res = await fetch(
    `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    { headers: { "AccessKey": BUNNY_API_KEY } }
  );

  if (!res.ok) return { status: 0, encodeProgress: 0, storageSize: 0 };

  const data = await res.json() as {
    status?: number;
    encodeProgress?: number;
    storageSize?: number;
  };

  return {
    status:         data.status         ?? 0,
    encodeProgress: data.encodeProgress ?? 0,
    storageSize:    data.storageSize    ?? 0,
  };
}

/**
 * Test connectivity — call this from /api/admin/test-bunny to verify
 * your BUNNY_API_KEY and BUNNY_LIBRARY_ID are correct before uploading.
 */
export async function testBunnyConnection(): Promise<{
  ok: boolean;
  libraryId: string;
  libraryName?: string;
  error?: string;
}> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    return { ok: false, libraryId: "", error: "BUNNY_API_KEY or BUNNY_LIBRARY_ID not set" };
  }

  try {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}`,
      { headers: { "AccessKey": BUNNY_API_KEY } }
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        libraryId: BUNNY_LIBRARY_ID,
        error: body.Message ?? `HTTP ${res.status} — check your API key and library ID`,
      };
    }

    const data = await res.json() as { Name?: string };
    return { ok: true, libraryId: BUNNY_LIBRARY_ID, libraryName: data.Name };
  } catch (err: unknown) {
    return { ok: false, libraryId: BUNNY_LIBRARY_ID, error: (err as Error).message };
  }
}
