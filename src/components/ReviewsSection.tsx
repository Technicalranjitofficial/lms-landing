"use client";

// ─── ReviewsSection ───────────────────────────────────────────────────────────
// Lazy-loaded reviews component. Wrapped in Suspense on the course detail page
// so it never blocks above-the-fold content (hero, curriculum, pricing card).
//
// Currently uses static data from the course object as a fallback.
// When the real API is ready: swap the hardcoded data for publicApi.getCourseReviews(slug)
// and use the useCourseReviews hook from src/hooks/useCourses.ts.

import { useState } from "react";
import { Star, ThumbsUp, MessageCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  name: string;
  avatar: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  helpful: number;
}

interface ReviewsSectionProps {
  rating: string;
  reviewsData: Review[];
}

const PAGE_SIZE = 4;

export default function ReviewsSection({ rating, reviewsData }: ReviewsSectionProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [helpfulVotes, setHelpfulVotes] = useState<Set<number>>(new Set());

  const visible = reviewsData.slice(0, visibleCount);
  const hasMore = visibleCount < reviewsData.length;

  function toggleHelpful(idx: number) {
    setHelpfulVotes((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  return (
    <div className="mb-5">
      <h2
        className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2.5"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Student Reviews
      </h2>

      {/* Rating summary */}
      {rating !== "—" && (
        <div className="flex items-center gap-4 mb-4 p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-center shrink-0">
            <div
              className="font-display font-black text-[1.7rem] text-[var(--color-amber)] leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {rating}
            </div>
            <div className="flex gap-0.5 justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={9} className="fill-current text-[var(--color-amber)]" />
              ))}
            </div>
            <p className="text-[0.6rem] text-[var(--color-fg-subtle)] mt-0.5">Course Rating</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((s) => {
              const pct = s === 5 ? 78 : s === 4 ? 16 : s === 3 ? 4 : s === 2 ? 1 : 1;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="flex-1 h-[4px] rounded-full bg-[var(--color-surface-3)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-amber)] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(s)].map((_, i) => (
                      <Star key={i} size={7} className="fill-current text-[var(--color-amber)]" />
                    ))}
                  </div>
                  <span className="text-[0.58rem] text-[var(--color-fg-muted)] w-6 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review cards */}
      {reviewsData.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {visible.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-1.5"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center text-[0.58rem] font-bold text-[var(--color-fg)] shrink-0">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-[0.72rem] font-semibold text-[var(--color-fg)]">{r.name}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          size={8}
                          className={cn("fill-current", j < r.rating ? "text-[var(--color-amber)]" : "text-[var(--color-fg-subtle)]")}
                        />
                      ))}
                      <span className="text-[0.56rem] text-[var(--color-fg-subtle)] ml-1">{r.date}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                {r.title && (
                  <p className="text-[0.72rem] font-semibold text-[var(--color-fg)]">{r.title}</p>
                )}
                <p className="text-[0.68rem] text-[var(--color-fg-muted)] leading-relaxed line-clamp-3">
                  {r.comment}
                </p>

                {/* Helpful */}
                <button
                  onClick={() => toggleHelpful(i)}
                  className={cn(
                    "self-start flex items-center gap-1 text-[0.62rem] transition-colors mt-auto",
                    helpfulVotes.has(i)
                      ? "text-[var(--color-brand-light)]"
                      : "text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]"
                  )}
                >
                  <ThumbsUp size={10} className={helpfulVotes.has(i) ? "fill-current" : ""} />
                  Helpful ({r.helpful + (helpfulVotes.has(i) ? 1 : 0)})
                </button>
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="btn btn-outline w-full justify-center mt-3 text-[0.75rem] py-2 gap-1.5"
            >
              Show more reviews <ChevronDown size={13} />
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <MessageCircle size={22} className="text-[var(--color-fg-subtle)] mx-auto mb-1.5" />
          <p className="text-[0.8rem] font-semibold text-[var(--color-fg)]">No reviews yet</p>
          <p className="text-[0.72rem] text-[var(--color-fg-muted)] mt-0.5">Be the first to review this course.</p>
        </div>
      )}
    </div>
  );
}
