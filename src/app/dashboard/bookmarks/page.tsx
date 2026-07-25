"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, BookmarkX, PlayCircle, Search, Loader2,
  AlertCircle, Star, Users, Clock, ShoppingCart, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bookmarksApi, type BookmarkRecord } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(paise / 100);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Bookmark Card ────────────────────────────────────────────────────────────

function BookmarkCard({
  record, onRemove,
}: { record: BookmarkRecord; onRemove: (courseId: string) => void }) {
  const { course } = record;
  const [removing, setRemoving] = useState(false);

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    setRemoving(true);
    try {
      await bookmarksApi.remove(course.id);
      onRemove(course.id);
    } catch {
      setRemoving(false);
    }
  }

  const discount = course.originalPrice && course.originalPrice > course.price
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden flex flex-col group hover:border-[var(--color-border-brand)] transition-colors"
    >
      {/* Thumbnail */}
      <Link href={`/courses/${course.slug}`} className="block relative">
        <div className="relative h-40 bg-gradient-to-br from-[var(--color-brand-dim)] to-[var(--color-cyan-dim)] overflow-hidden">
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookmarkX size={32} className="text-[var(--color-fg-subtle)]" />
            </div>
          )}
          {/* Discount badge */}
          {discount && (
            <span className="absolute top-2.5 left-2.5 bg-[var(--color-rose)] text-white text-[0.62rem] font-bold px-2 py-0.5 rounded-lg">
              {discount}% OFF
            </span>
          )}
          {/* Tag badge */}
          {course.tag && (
            <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[0.58rem] font-semibold px-2 py-0.5 rounded-lg">
              {course.tag}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title */}
        <Link href={`/courses/${course.slug}`} className="block">
          <h3 className="font-semibold text-[0.9rem] text-[var(--color-fg)] leading-snug line-clamp-2 hover:text-[var(--color-brand-light)] transition-colors">
            {course.title}
          </h3>
        </Link>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          {course.instructor.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.instructor.avatar} alt={course.instructor.name}
              className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[var(--color-brand-dim)] flex items-center justify-center">
              <span className="text-[0.5rem] font-bold text-[var(--color-brand)]">
                {course.instructor.name[0]}
              </span>
            </div>
          )}
          <span className="text-[0.72rem] text-[var(--color-fg-muted)] truncate">
            {course.instructor.name}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[0.68rem] text-[var(--color-fg-muted)]">
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1">
              <Star size={10} className="text-[var(--color-amber)] fill-[var(--color-amber)]" />
              {course.averageRating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={10} />
            {course.studentsEnrolled.toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {course.duration}
          </span>
          <span className="ml-auto text-[0.6rem] text-[var(--color-fg-subtle)]">
            Saved {fmtDate(record.createdAt)}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-display font-black text-[1rem] text-[var(--color-fg)]">
            {fmtPrice(course.price)}
          </span>
          {course.originalPrice && course.originalPrice > course.price && (
            <span className="text-[0.72rem] text-[var(--color-fg-subtle)] line-through">
              {fmtPrice(course.originalPrice)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <Link
            href={`/courses/${course.slug}`}
            className="flex-1 btn btn-brand py-2 text-[0.75rem] justify-center"
          >
            <PlayCircle size={13} /> View Course
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Remove bookmark"
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-xl border transition-all",
              "border-[var(--color-border)] text-[var(--color-fg-muted)]",
              "hover:border-[var(--color-rose)] hover:text-[var(--color-rose)] hover:bg-[rgba(251,113,133,0.08)]",
              removing && "opacity-50 cursor-not-allowed"
            )}
          >
            {removing
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-dim)] flex items-center justify-center">
          <Bookmark size={28} className="text-[var(--color-brand)]" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-bold text-xl text-[var(--color-fg)]">
          {filtered ? "No results" : "No bookmarks yet"}
        </h3>
        <p className="text-[0.84rem] text-[var(--color-fg-muted)] max-w-sm leading-relaxed">
          {filtered
            ? "Try a different search term."
            : "Browse courses and click the bookmark icon to save them for later."}
        </p>
      </div>
      {!filtered && (
        <Link href="/courses" className="btn btn-brand">
          <ShoppingCart size={15} /> Browse Courses
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [search,    setSearch]    = useState("");
  const [sort,      setSort]      = useState<"newest" | "price-low" | "price-high" | "rating">("newest");

  useEffect(() => {
    bookmarksApi
      .getMine()
      .then(setBookmarks)
      .catch((e) => setError(e.message ?? "Failed to load bookmarks"))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = useCallback((courseId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.course.id !== courseId));
  }, []);

  // Filter + sort
  const filtered = bookmarks
    .filter((b) =>
      search.trim()
        ? b.course.title.toLowerCase().includes(search.toLowerCase()) ||
          b.course.instructor.name.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sort === "price-low")  return a.course.price - b.course.price;
      if (sort === "price-high") return b.course.price - a.course.price;
      if (sort === "rating")     return b.course.averageRating - a.course.averageRating;
      // newest first (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
      >
        <div>
          <h1 className="font-display font-black text-2xl text-[var(--color-fg)]">Bookmarks</h1>
          <p className="text-[0.82rem] text-[var(--color-fg-muted)] mt-0.5">
            {loading
              ? "Loading…"
              : `${bookmarks.length} course${bookmarks.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
        <Link href="/courses" className="btn btn-outline shrink-0 text-[0.82rem]">
          <ShoppingCart size={14} /> Browse More
        </Link>
      </motion.div>

      {/* Toolbar */}
      {!loading && bookmarks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks…"
              className="w-full input pl-9 py-2.5 text-[0.82rem]"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-xl p-1 ml-auto">
            {(
              [
                { value: "newest",     label: "Newest"     },
                { value: "price-low",  label: "Price ↑"    },
                { value: "price-high", label: "Price ↓"    },
                { value: "rating",     label: "Top rated"  },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold transition-all whitespace-nowrap",
                  sort === opt.value
                    ? "bg-[var(--color-brand)] text-white shadow-sm"
                    : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-dim)] flex items-center justify-center">
            <Bookmark size={24} className="text-[var(--color-brand)]" />
          </div>
          <Loader2 size={32} className="animate-spin text-[var(--color-brand)] -mt-10" />
          <p className="text-[0.82rem] text-[var(--color-fg-muted)]">Loading bookmarks…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle size={32} className="text-[var(--color-rose)]" />
          <p className="text-[var(--color-fg)] font-semibold">Something went wrong</p>
          <p className="text-[0.82rem] text-[var(--color-fg-muted)]">{error}</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState filtered={false} />
      ) : filtered.length === 0 ? (
        <EmptyState filtered={true} />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((record) => (
              <BookmarkCard
                key={record.id}
                record={record}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
