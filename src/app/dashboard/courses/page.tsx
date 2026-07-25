"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, PlayCircle, CheckCircle, Clock, LayoutGrid,
  List, Search, AlertCircle, Loader2, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { studentApi, type EnrollmentRecord } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradientForIndex(i: number) {
  const gradients = [
    "from-[#7c6fff] to-[#22d3ee]",
    "from-[#34d399] to-[#22d3ee]",
    "from-[#fb7185] to-[#a78bfa]",
    "from-[#fbbf24] to-[#fb7185]",
    "from-[#a78bfa] to-[#7c6fff]",
    "from-[#22d3ee] to-[#34d399]",
  ];
  return gradients[i % gradients.length];
}

function statusBadge(status: EnrollmentRecord["status"]) {
  const map: Record<EnrollmentRecord["status"], { label: string; cls: string }> = {
    ACTIVE:    { label: "In Progress", cls: "badge-cyan"   },
    COMPLETED: { label: "Completed",   cls: "badge-green"  },
    EXPIRED:   { label: "Expired",     cls: "badge-amber"  },
    REFUNDED:  { label: "Refunded",    cls: "badge-rose"   },
  };
  const s = map[status];
  return <span className={cn("badge", s.cls)}>{s.label}</span>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Card views ───────────────────────────────────────────────────────────────

function CourseCard({ enrollment, index }: { enrollment: EnrollmentRecord; index: number }) {
  const pct = enrollment.progressPercent ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="card overflow-hidden flex flex-col hover:border-[var(--color-border-brand)] transition-colors"
    >
      {/* Thumbnail */}
      <div className={cn("h-32 bg-gradient-to-br shrink-0 relative", gradientForIndex(index))}>
        {enrollment.course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <BookOpen size={36} className="text-white" />
          </div>
        )}
        <div className="absolute top-3 right-3">{statusBadge(enrollment.status)}</div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-[0.88rem] text-[var(--color-fg)] leading-snug line-clamp-2">
            {enrollment.course.title}
          </h3>
          <p className="text-[0.72rem] text-[var(--color-fg-muted)]">
            {enrollment.course.instructor.name}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[0.68rem] text-[var(--color-fg-muted)]">
            <span>{pct}% complete</span>
            <span className="flex items-center gap-1">
              <Clock size={9} /> {enrollment.course.duration}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Enrolled date + CTA */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[0.68rem] text-[var(--color-fg-subtle)]">
            Enrolled {fmtDate(enrollment.enrolledAt)}
          </span>
          {enrollment.status === "COMPLETED" ? (
            <Link
              href={`/courses/${enrollment.course.slug}/learn`}
              className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors"
            >
              <ExternalLink size={12} /> Review
            </Link>
          ) : (
            <Link
              href={`/courses/${enrollment.course.slug}/learn`}
              className="btn btn-brand py-2 px-3 text-[0.72rem]"
            >
              <PlayCircle size={13} /> Resume
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CourseRow({ enrollment, index }: { enrollment: EnrollmentRecord; index: number }) {
  const pct = enrollment.progressPercent ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card p-4 flex items-center gap-4 hover:border-[var(--color-border-brand)] transition-colors"
    >
      {/* Thumbnail */}
      <div className={cn("w-16 h-16 rounded-xl shrink-0 relative overflow-hidden bg-gradient-to-br", gradientForIndex(index))}>
        {enrollment.course.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={enrollment.course.thumbnail} alt={enrollment.course.title}
            className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start gap-2 flex-wrap">
          <h3 className="font-semibold text-[0.88rem] text-[var(--color-fg)] leading-tight flex-1 min-w-0 truncate">
            {enrollment.course.title}
          </h3>
          {statusBadge(enrollment.status)}
        </div>
        <p className="text-[0.72rem] text-[var(--color-fg-muted)]">{enrollment.course.instructor.name}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 progress-bar max-w-[180px]">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[0.68rem] text-[var(--color-fg-muted)] shrink-0">{pct}%</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/courses/${enrollment.course.slug}/learn`}
        className="btn btn-brand py-2 px-4 text-[0.78rem] shrink-0"
      >
        <PlayCircle size={14} /> {enrollment.status === "COMPLETED" ? "Review" : "Resume"}
      </Link>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-dim)] flex items-center justify-center">
        <BookOpen size={28} className="text-[var(--color-brand)]" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-bold text-lg text-[var(--color-fg)]">No courses yet</h3>
        <p className="text-[0.84rem] text-[var(--color-fg-muted)] max-w-xs">
          Explore our catalogue and enroll in your first course.
        </p>
      </div>
      <Link href="/courses" className="btn btn-brand">Browse Courses</Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [view,        setView]        = useState<"grid" | "list">("grid");
  const [filter,      setFilter]      = useState<"all" | "active" | "completed">("all");
  const [search,      setSearch]      = useState("");

  useEffect(() => {
    studentApi
      .getMyEnrollments()
      .then(setEnrollments)
      .catch((e) => setError(e.message ?? "Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = enrollments
    .filter((e) => {
      if (filter === "active")    return e.status === "ACTIVE";
      if (filter === "completed") return e.status === "COMPLETED";
      return true;
    })
    .filter((e) =>
      search.trim()
        ? e.course.title.toLowerCase().includes(search.toLowerCase())
        : true
    );

  // Stats
  const total     = enrollments.length;
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
  const avgPct    = total
    ? Math.round(enrollments.reduce((s, e) => s + (e.progressPercent ?? 0), 0) / total)
    : 0;

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="font-display font-black text-2xl text-[var(--color-fg)]">My Courses</h1>
          <p className="text-[0.82rem] text-[var(--color-fg-muted)] mt-0.5">
            {total} course{total !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <Link href="/courses" className="btn btn-outline shrink-0">
          Browse More
        </Link>
      </motion.div>

      {/* Quick stats */}
      {!loading && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Enrolled",  value: total,    icon: BookOpen,     cls: "text-[var(--color-brand)] bg-[var(--color-brand-dim)]" },
            { label: "Completed", value: completed, icon: CheckCircle,  cls: "text-[var(--color-green)] bg-[rgba(52,211,153,0.12)]" },
            { label: "Avg Progress", value: `${avgPct}%`, icon: Clock, cls: "text-[var(--color-cyan)] bg-[var(--color-cyan-dim)]" },
          ].map(({ label, value, icon: Icon, cls }) => (
            <div key={label} className="card p-3 sm:p-4 flex items-center gap-3">
              <span className={cn("p-2 rounded-lg shrink-0", cls)}>
                <Icon size={15} />
              </span>
              <div>
                <p className="font-display font-black text-lg leading-none text-[var(--color-fg)]">{value}</p>
                <p className="text-[0.68rem] text-[var(--color-fg-muted)] mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Toolbar */}
      {!loading && total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="w-full input pl-9 py-2.5 text-[0.82rem]"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-xl p-1">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold capitalize transition-all",
                  filter === f
                    ? "bg-[var(--color-brand)] text-white shadow-sm"
                    : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-xl p-1 ml-auto">
            <button
              onClick={() => setView("grid")}
              className={cn("p-1.5 rounded-lg transition-colors", view === "grid" ? "bg-[var(--color-brand)] text-white" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]")}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-lg transition-colors", view === "list" ? "bg-[var(--color-brand)] text-white" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]")}
            >
              <List size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin text-[var(--color-brand)]" />
          <p className="text-[0.82rem] text-[var(--color-fg-muted)]">Loading your courses…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle size={32} className="text-[var(--color-rose)]" />
          <p className="text-[var(--color-fg)] font-semibold">Something went wrong</p>
          <p className="text-[0.82rem] text-[var(--color-fg-muted)]">{error}</p>
        </div>
      ) : total === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-fg-muted)] text-[0.88rem]">No courses match your filter.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e, i) => (
            <CourseCard key={e.id} enrollment={e} index={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e, i) => (
            <CourseRow key={e.id} enrollment={e} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
