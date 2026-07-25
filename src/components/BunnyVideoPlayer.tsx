"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Play, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BunnyVideoPlayerProps {
  /** Bunny Stream video ID (GUID) */
  videoId?: string;
  /** Bunny Stream library ID */
  libraryId?: string;
  /** Thumbnail image URL shown before play */
  thumbnail?: string;
  /** Alt text for the thumbnail */
  alt?: string;
  /** Show as inline embed (no modal) — default is modal */
  inline?: boolean;
  className?: string;
}

const DEFAULT_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID ?? "";
const DEMO_VIDEO_ID = process.env.NEXT_PUBLIC_BUNNY_DEMO_VIDEO_ID ?? "";

function buildEmbedUrl(libraryId: string, videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "true",
    loop: "false",
    muted: "false",
    preload: "true",
    responsive: "true",
  });
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?${params.toString()}`;
}

export default function BunnyVideoPlayer({
  videoId = DEMO_VIDEO_ID,
  libraryId = DEFAULT_LIBRARY_ID,
  thumbnail,
  alt = "Course preview video",
  inline = false,
  className,
}: BunnyVideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = buildEmbedUrl(libraryId, videoId);

  // ─── Inline embed (used inside dashboard player) ───
  if (inline) {
    return (
      <div className={cn("relative w-full aspect-video bg-black rounded-xl overflow-hidden", className)}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]">
            <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={alt}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  }

  // ─── Modal / overlay mode (used on course detail preview) ───
  return (
    <>
      {/* Thumbnail trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "group/vid relative w-full aspect-video overflow-hidden rounded-lg cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:outline-none",
          className
        )}
        aria-label="Play course preview"
      >
        {thumbnail ? (
          <Image src={thumbnail} alt={alt} fill className="object-cover transition-transform duration-500 group-hover/vid:scale-105" sizes="(max-width: 768px) 100vw, 340px" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-dark)] to-[#1a1a2e]" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover/vid:bg-black/30 transition-colors" />

        {/* Play button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover/vid:scale-110 group-hover/vid:bg-white transition-all duration-300">
            <Play size={20} className="text-black fill-black ml-1" />
          </div>
          <span className="text-[0.72rem] font-semibold text-white/90 tracking-wide">Preview this course</span>
        </div>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div className="relative w-full max-w-3xl">
            {/* Header bar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[0.8rem] font-semibold text-white/80">Course Preview</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => iframeRef.current?.requestFullscreen?.()}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                  aria-label="Fullscreen"
                >
                  <Maximize2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Player */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-[0_24px_80px_rgba(0,0,0,0.9)]">
              {/* Spinner while iframe loads */}
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]">
                  <div className="w-10 h-10 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={alt}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoaded(true)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
