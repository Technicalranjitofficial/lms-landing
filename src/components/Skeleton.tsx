"use client";

import { cn } from "@/lib/utils";

// ─── Base pulse block ─────────────────────────────────────────────────────────
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-[var(--color-surface-2)] animate-pulse",
        className
      )}
    />
  );
}

// ─── Course card skeleton — matches spotlight-card dimensions ─────────────────
export function CourseCardSkeleton() {
  return (
    <div className="rounded-[20px] bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
      {/* Thumbnail */}
      <SkeletonBlock className="w-full aspect-video rounded-none" />
      <div className="p-5 space-y-3">
        {/* Tag + level */}
        <div className="flex gap-2">
          <SkeletonBlock className="h-5 w-20 rounded-full" />
          <SkeletonBlock className="h-5 w-16 rounded-full" />
        </div>
        {/* Title */}
        <SkeletonBlock className="h-5 w-4/5" />
        <SkeletonBlock className="h-4 w-3/5" />
        {/* Meta row */}
        <div className="flex gap-3 pt-1">
          <SkeletonBlock className="h-3.5 w-14" />
          <SkeletonBlock className="h-3.5 w-14" />
          <SkeletonBlock className="h-3.5 w-10" />
        </div>
        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <SkeletonBlock className="h-6 w-20" />
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Course grid skeleton — 6 cards ──────────────────────────────────────────
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Review card skeleton ─────────────────────────────────────────────────────
export function ReviewCardSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="w-6 h-6 rounded-full flex-shrink-0" />
        <div className="space-y-1 flex-1">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-2.5 w-16" />
        </div>
      </div>
      <SkeletonBlock className="h-3 w-3/4" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  );
}

// ─── Reviews section skeleton ─────────────────────────────────────────────────
export function ReviewsSectionSkeleton() {
  return (
    <div className="mb-5">
      <SkeletonBlock className="h-5 w-24 mb-4" />
      {/* Rating summary */}
      <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-4">
        <div className="text-center space-y-1">
          <SkeletonBlock className="h-8 w-10 mx-auto" />
          <SkeletonBlock className="h-2.5 w-16" />
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <SkeletonBlock className="flex-1 h-[4px] rounded-full" />
              <SkeletonBlock className="h-3 w-3" />
            </div>
          ))}
        </div>
      </div>
      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Inline text skeleton (for replacing a single line) ──────────────────────
export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-2/3"];
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className={cn("h-3.5", widths[i % widths.length])} />
      ))}
    </div>
  );
}
