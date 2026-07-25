import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Existing
      { protocol: "https", hostname: "images.unsplash.com" },
      // Bunny Stream CDN (video thumbnails)
      { protocol: "https", hostname: "*.b-cdn.net" },
      { protocol: "https", hostname: "vz-cb53ece6-89e.b-cdn.net" },
      // Cloudflare R2 public bucket (course thumbnails, resources)
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "cdn.codepath.dev" },
      // Generic R2 custom domain fallback
      { protocol: "https", hostname: "*.codepath.dev" },
      // Instructor avatars (Unsplash, etc.)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Needed for server actions that call external APIs (Bunny, R2)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
