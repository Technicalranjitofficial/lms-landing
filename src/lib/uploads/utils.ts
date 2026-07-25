/**
 * Shared upload utilities — NO "use server" directive.
 * Safe to import from both server actions and client components.
 */

/** Guess MIME type from filename extension */
export function guessContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    png:  "image/png",
    gif:  "image/gif",
    webp: "image/webp",
    svg:  "image/svg+xml",
    pdf:  "application/pdf",
    zip:  "application/zip",
    doc:  "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt:  "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    mp4:  "video/mp4",
    mkv:  "video/x-matroska",
    mov:  "video/quicktime",
    avi:  "video/x-msvideo",
  };
  return map[ext] ?? "application/octet-stream";
}

/**
 * Generate a unique R2 object key.
 * e.g. r2Key("courses/thumbnails", "my photo.jpg")
 *   → "courses/thumbnails/1720000000000-my-photo.jpg"
 */
export function r2Key(folder: string, filename: string): string {
  const ext   = filename.split(".").pop() ?? "bin";
  const base  = filename
    .toLowerCase()
    .replace(/\.[^.]+$/, "")       // strip extension
    .replace(/[^a-z0-9]/g, "-")   // non-alphanumeric → dash
    .replace(/-+/g, "-")           // collapse dashes
    .replace(/^-|-$/g, "")         // trim leading/trailing dashes
    .slice(0, 60);
  return `${folder}/${Date.now()}-${base || "file"}.${ext}`;
}
