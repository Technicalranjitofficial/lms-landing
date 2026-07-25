"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, CheckCircle, Clock, Award, Flame, PlayCircle,
  Loader2, AlertCircle, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/AuthProvider";
import {
  studentApi, certificatesApi, lessonProgressApi,
  type EnrollmentRecord, type CertificateRecord,
} from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashStats {
  enrolled:     number;
  completed:    number;
  certificates: number;
  totalLessons: number;
  doneLessons:  number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradientForIndex(i: number) {
  const g = [
    "from-[#7c6fff] to-[#22d3ee]",
    "from-[#34d399] to-[#22d3ee]",
    "from-[#fb7185] to-[#a78bfa]",
    "from-[#fbbf24] to-[#fb7185]",
    "from-[#a78bfa] to-[#7c6fff]",
  ];
  return g[i % g.length];
}

function fmtDuration(dur: string) {
  return dur;
}

const colorMap: Record<string, string> = {
  brand: "text-[var(--color-brand)] bg-[var(--color-brand-dim)]",
  green: "text-[var(--color-green)] bg-[rgba(52,211,153,0.12)]",
  cyan:  "text-[var(--color-cyan)]  bg-[var(--color-cyan-dim)]",
  amber: "text-[var(--color-amber)] bg-[rgba(251,191,36,0.12)]",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("card animate-pulse", className)}>
      <div className="h-4 bg-[var(--color-surface-3)] rounded w-1/2 mb-2" />
      <div className="h-7 bg-[var(--color-surface-3)] rounded w-1/3" />
    </div>
  );
}

// ─── Continue Course card ─────────────────────────────────────────────────────

function ContinueCourseCard({ enrollment, index }: { enrollment: EnrollmentRecord; index: number }) {
  const pct = enrollment.progressPercent ?? 0;
  return (
    <div className="card p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      <div className={cn(
        "w-full sm:w-32 h-20 rounded-xl shrink-0 relative overflow-hidden bg-gradient-to-br",
        gradientForIndex(index)
      )}>
        {enrollment.course.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={enrollment.course.thumbnail} alt={enrollment.course.title}
            className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <p className="font-semibold text-[0.92rem] text-[var(--color-fg)]">{enrollment.course.title}</p>
        <p className="text-[0.78rem] text-[var(--color-fg-muted)] flex items-center gap-1.5">
          <Clock size={11} /> {fmtDuration(enrollment.course.duration)}
          <span className="mx-1">·</span>
          {enrollment.course.totalLectures} lessons
        </p>
        <div className="space-y-1">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[0.7rem] text-[var(--color-fg-muted)]">{pct}% complete</p>
        </div>
      </div>
      <Link
        href={`/courses/${enrollment.course.slug}/learn`}
        className="btn btn-brand shrink-0"
      >
        <PlayCircle size={16} /> Resume
      </Link>
    </div>
  );
}

// ─── Enrolled course mini-card ────────────────────────────────────────────────

function MiniCourseCard({ enrollment, index }: { enrollment: EnrollmentRecord; index: number }) {
  const pct = enrollment.progressPercent ?? 0;
  return (
    <Link
      href={`/courses/${enrollment.course.slug}/learn`}
      className="card overflow-hidden hover:border-[var(--color-border-brand)] transition-colors block"
    >
      <div className={cn("h-28 bg-gradient-to-br relative", gradientForIndex(index))}>
        {enrollment.course.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={enrollment.course.thumbnail} alt={enrollment.course.title}
            className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="p-4 space-y-3">
        <p className="font-semibold text-[0.86rem] text-[var(--color-fg)] leading-snug line-clamp-2">
          {enrollment.course.title}
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[0.7rem] text-[var(--color-fg-muted)]">
            <span>{pct}% complete</span>
            <span className={cn("font-semibold", pct === 100 ? "text-[var(--color-green)]" : "text-[var(--color-brand-light)]")}>
              {pct === 100 ? "Done ✓" : "In progress"}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const { user } = useAuthContext();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [certs,       setCerts]       = useState<CertificateRecord[]>([]);
  const [doneLessons, setDoneLessons] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch enrollments + certificates in parallel
        const [enrollData, certData] = await Promise.all([
          studentApi.getMyEnrollments(),
          certificatesApi.getMine().catch(() => [] as CertificateRecord[]),
        ]);

        setEnrollments(enrollData);
        setCerts(certData);

        // Sum up completed lessons across all active enrollments
        let totalDone = 0;
        await Promise.allSettled(
          enrollData
            .filter((e) => e.status === "ACTIVE" || e.status === "COMPLETED")
            .map(async (e) => {
              try {
                const progress = await lessonProgressApi.getByEnrollment(e.id);
                totalDone += progress.filter((p) => p.completed).length;
              } catch {
                // non-critical
              }
            })
        );
        setDoneLessons(totalDone);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derive stats
  const stats: DashStats = {
    enrolled:     enrollments.length,
    completed:    enrollments.filter((e) => e.status === "COMPLETED").length,
    certificates: certs.length,
    totalLessons: enrollments.reduce((s, e) => s + (e.course.totalLectures ?? 0), 0),
    doneLessons,
  };

  // Total watched hours (rough estimate: avg lesson ~8 min)
  const hoursWatched = Math.round((doneLessons * 8) / 60);

  const STATS = [
    { label: "Courses Enrolled",    value: loading ? "–" : String(stats.enrolled),             icon: BookOpen,    color: "brand" },
    { label: "Lessons Completed",   value: loading ? "–" : String(stats.doneLessons),          icon: CheckCircle, color: "green" },
    { label: "Hours Watched",       value: loading ? "–" : `${hoursWatched}h`,                 icon: Clock,       color: "cyan"  },
    { label: "Certificates Earned", value: loading ? "–" : String(stats.certificates),         icon: Award,       color: "amber" },
  ];

  // Most recent active enrollment = continue learning candidate
  const continueCourse = enrollments.find((e) => e.status === "ACTIVE");
  // All enrollments for mini-cards (max 3)
  const recentCourses  = enrollments.slice(0, 3);

  return (
    <div className="space-y-8 max-w-[1100px]">

      {/* Welcome banner */}
      <motion.div
        initial="hidden" animate="show"
        variants={fadeUp}
        transition={{ duration: 0.45 }}
        className="card p-6 flex items-center justify-between gap-4 overflow-hidden relative"
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[var(--color-brand-dim)] blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <h2 className="font-display font-black text-xl text-[var(--color-fg)]">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-[0.84rem] text-[var(--color-fg-muted)]">
            {loading
              ? "Loading your progress…"
              : stats.enrolled === 0
              ? "Start your learning journey — browse available courses."
              : `Keep the momentum going — you're doing great!`}
          </p>
        </div>

        {/* Streak counter (placeholder — no streak API yet) */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2 bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.2)] rounded-2xl px-4 py-2.5">
            <Flame size={20} className="text-[var(--color-amber)]" />
            <div className="text-center">
              <p className="font-display font-black text-lg text-[var(--color-amber)] leading-none">🔥</p>
              <p className="text-[0.6rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide">streak</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 xl:grid-cols-4 gap-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      >
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="card p-4 flex items-center gap-4"
            >
              <span className={cn("p-2.5 rounded-xl shrink-0", colorMap[stat.color])}>
                <Icon size={18} />
              </span>
              <div>
                {loading
                  ? <div className="h-6 w-12 bg-[var(--color-surface-3)] rounded animate-pulse mb-1" />
                  : <p className="font-display font-black text-xl text-[var(--color-fg)] leading-none">{stat.value}</p>}
                <p className="text-[0.72rem] text-[var(--color-fg-muted)] mt-0.5 leading-snug">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Error */}
      {error && (
        <div className="card p-4 flex items-center gap-3 border-[rgba(251,113,133,0.3)]">
          <AlertCircle size={18} className="text-[var(--color-rose)] shrink-0" />
          <p className="text-[0.84rem] text-[var(--color-fg-muted)]">{error}</p>
        </div>
      )}

      {/* Continue learning */}
      <motion.div
        initial="hidden" animate="show"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="space-y-3"
      >
        <h2 className="font-display font-bold text-lg text-[var(--color-fg)]">Continue Learning</h2>

        {loading ? (
          <div className="card p-5 flex items-center gap-4">
            <div className="w-32 h-20 rounded-xl bg-[var(--color-surface-3)] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--color-surface-3)] rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-[var(--color-surface-3)] rounded w-1/2 animate-pulse" />
              <div className="h-2 bg-[var(--color-surface-3)] rounded animate-pulse" />
            </div>
          </div>
        ) : continueCourse ? (
          <ContinueCourseCard enrollment={continueCourse} index={0} />
        ) : (
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-dim)] flex items-center justify-center shrink-0">
              <BookOpen size={22} className="text-[var(--color-brand)]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[0.9rem] text-[var(--color-fg)]">
                {stats.completed > 0 ? "All courses completed! 🎉" : "No courses enrolled yet"}
              </p>
              <p className="text-[0.78rem] text-[var(--color-fg-muted)] mt-0.5">
                {stats.completed > 0
                  ? "Browse more courses to keep learning."
                  : "Pick a course and start your journey."}
              </p>
            </div>
            <Link href="/courses" className="btn btn-brand shrink-0">Browse Courses</Link>
          </div>
        )}
      </motion.div>

      {/* Enrolled courses grid */}
      <motion.div
        initial="hidden" animate="show"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.38 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-[var(--color-fg)]">My Courses</h2>
          <Link
            href="/dashboard/courses"
            className="flex items-center gap-1 text-[0.78rem] font-medium text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} className="p-4 h-48" />
            ))}
          </div>
        ) : recentCourses.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-[0.84rem] text-[var(--color-fg-muted)]">
              You haven&apos;t enrolled in any courses yet.{" "}
              <Link href="/courses" className="text-[var(--color-brand-light)] hover:underline">
                Browse courses →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCourses.map((e, i) => (
              <MiniCourseCard key={e.id} enrollment={e} index={i} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Certificates quick-view */}
      {!loading && certs.length > 0 && (
        <motion.div
          initial="hidden" animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.46 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[var(--color-fg)]">Recent Certificates</h2>
            <Link
              href="/dashboard/certificates"
              className="flex items-center gap-1 text-[0.78rem] font-medium text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certs.slice(0, 3).map((cert, i) => {
              const THEMES = [
                { sidebar: "#312E81", accent: "#4F46E5", light: "#EEF2FF" },
                { sidebar: "#164E63", accent: "#0891B2", light: "#ECFEFF" },
                { sidebar: "#14532D", accent: "#16A34A", light: "#F0FDF4" },
                { sidebar: "#4C1D95", accent: "#7C3AED", light: "#F5F3FF" },
                { sidebar: "#7F1D1D", accent: "#DC2626", light: "#FEF2F2" },
              ];
              const t = THEMES[i % THEMES.length];
              return (
                <Link
                  key={cert.id}
                  href="/dashboard/certificates"
                  className="group relative rounded-[20px] overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-border-brand)] transition-all hover:-translate-y-1"
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.35)" }}
                >
                  {/* Mini certificate preview */}
                  <div className="relative h-[110px] overflow-hidden"
                    style={{ background: "#F5F2EC" }}>
                    {/* Dot texture */}
                    <div className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `radial-gradient(circle, #B0A898 1px, transparent 1px)`,
                        backgroundSize: "18px 18px",
                      }} />
                    {/* Watermark logo */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
                      <div className="text-[72px] font-black"
                        style={{ color: t.sidebar, fontFamily: "Georgia, serif" }}>
                        CGS
                      </div>
                    </div>
                    {/* Left sidebar strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-[14px]"
                      style={{ background: `linear-gradient(to bottom, ${t.sidebar}, ${t.accent})` }} />
                    {/* Frame lines */}
                    <div className="absolute inset-[6px] border border-[var(--color-border)] opacity-40"
                      style={{ left: "20px", borderColor: t.accent }} />
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6"
                      style={{ paddingLeft: "26px" }}>
                      {/* Seal */}
                      <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: t.accent, background: t.light }}>
                        <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
                          <polyline points="4,10 8,14 16,6"
                            stroke={t.accent} strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {/* Course title */}
                      <p className="text-[0.62rem] font-bold text-center line-clamp-1 leading-tight"
                        style={{ color: t.sidebar, fontFamily: "Georgia, serif" }}>
                        {cert.course.title}
                      </p>
                      <p className="text-[0.52rem] font-mono" style={{ color: t.accent, opacity: 0.7 }}>
                        {cert.certificateNumber}
                      </p>
                    </div>
                    {/* Bottom bar */}
                    <div className="absolute bottom-0 left-[14px] right-0 h-[6px]"
                      style={{ background: t.accent, opacity: 0.85 }} />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      style={{ background: `${t.accent}22`, backdropFilter: "blur(1px)" }}>
                      <span className="text-[0.62rem] font-bold px-2 py-1 rounded-lg text-white"
                        style={{ background: t.accent }}>
                        View →
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-3 bg-[var(--color-surface)] space-y-1">
                    <p className="font-semibold text-[0.82rem] text-[var(--color-fg)] line-clamp-1 leading-snug">
                      {cert.course.title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: t.accent }} />
                      <p className="text-[0.64rem] font-mono text-[var(--color-fg-muted)]">
                        {cert.certificateNumber}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
