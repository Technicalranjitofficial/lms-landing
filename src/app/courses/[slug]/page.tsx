"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, ArrowRight, BookOpen, Users, Star, Play, CheckCircle,
  ChevronDown, ChevronUp, Award, Target, FileText, Video,
  Download, Lock, Sparkles, Share2, Globe2, Infinity,
  GraduationCap, Loader2, AlertCircle, BookMarked, Bookmark, CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { publicApi, studentApi, bookmarksApi, type Course } from "@/lib/api";
import Footer from "@/components/Footer";
import CheckoutModal from "@/components/CheckoutModal";
import BunnyVideoPlayer from "@/components/BunnyVideoPlayer";
import { ReviewsSectionSkeleton } from "@/components/Skeleton";

const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paise(n: number) {
  return `₹${Math.round(n / 100).toLocaleString("en-IN")}`;
}

function fmtDuration(seconds?: number) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] animate-pulse">
      <div className="h-[200px] bg-[#1a1a2e]" />
      <div className="container py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-[var(--color-surface-2)]" />)}
          </div>
          <div className="hidden lg:block h-96 rounded-xl bg-[var(--color-surface-2)]" />
        </div>
      </div>
    </div>
  );
}

// ─── EnrollCard ───────────────────────────────────────────────────────────────

function EnrollCard({ course, wishlist, onWishlist, onShare, shareCopied, onCheckout, courseId }: {
  course: Course; wishlist: boolean; onWishlist: () => void;
  onShare: () => void; shareCopied: boolean;
  onCheckout: () => void; courseId: string;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [enrolled,    setEnrolled]    = useState(false);
  const [checking,    setChecking]    = useState(true);
  const [enrolling,   setEnrolling]   = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const sale = paise(course.price);
  const orig = course.originalPrice ? paise(course.originalPrice) : null;
  const disc = orig && course.originalPrice && course.originalPrice > course.price
    ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;

  // Check enrollment once session is ready
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) { setChecking(false); return; }
    studentApi.checkEnrollment(courseId)
      .then(({ enrolled }) => setEnrolled(enrolled))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [courseId, session, sessionStatus]);

  async function handleEnroll() {
    if (!session) { router.push(`/login?callbackUrl=/courses/${course.slug}`); return; }
    setEnrolling(true);
    setEnrollError(null);
    try {
      await studentApi.enroll(courseId);
      setEnrolled(true);
      router.push(`/courses/${course.slug}/learn`);
    } catch (e: unknown) {
      const msg = (e as Error).message ?? "Enrollment failed";
      // Already enrolled → just navigate
      if (msg.toLowerCase().includes("already")) {
        router.push(`/courses/${course.slug}/learn`);
      } else {
        setEnrollError(msg);
        setEnrolling(false);
      }
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Preview video — shows thumbnail with play button; opens Bunny iframe on click */}
      <BunnyVideoPlayer
        videoId={course.previewVideoId || undefined}
        thumbnail={course.thumbnail || undefined}
        alt={`${course.title} preview`}
      />

      <div className="p-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display font-black text-[1.4rem] text-[var(--color-fg)] leading-none" style={{ fontFamily: "var(--font-display)" }}>{sale}</span>
          {orig && <span className="text-[0.8rem] text-[var(--color-fg-subtle)] line-through">{orig}</span>}
          {disc > 0 && <span className="ml-auto text-[0.7rem] font-bold px-2 py-0.5 rounded-md bg-[var(--color-brand-dim)] text-[var(--color-brand)] border border-[var(--color-border-brand)]">{disc}% OFF</span>}
        </div>
        {disc > 0 && <p className="text-[0.68rem] text-rose-300 mb-3 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />Limited time offer</p>}

        {/* CTA — changes based on enrollment state */}
        {checking || sessionStatus === "loading" ? (
          <div className="h-10 rounded-xl bg-[var(--color-surface-2)] animate-pulse mb-2" />
        ) : enrolled ? (
          <Link href={`/courses/${course.slug}/learn`}
            className="btn btn-brand w-full justify-center py-2.5 px-3 text-[0.78rem] mb-2 font-bold gap-2">
            <BookMarked size={15} /> Continue Learning
          </Link>
        ) : (
          <button onClick={session ? onCheckout : () => router.push(`/login?callbackUrl=/courses/${course.slug}`)}
            disabled={enrolling}
            className="btn btn-brand w-full justify-center py-2.5 px-3 text-[0.78rem] mb-2 font-bold disabled:opacity-70 gap-2">
            {enrolling ? <><Loader2 size={14} className="animate-spin" /> Enrolling…</> : <>Enroll Now <ArrowRight size={13} /></>}
          </button>
        )}

        {enrollError && (
          <p className="text-[0.7rem] text-[var(--color-rose)] flex items-center gap-1.5 mb-2">
            <AlertCircle size={12} /> {enrollError}
          </p>
        )}

        {!enrolled && (
          <>
            <p className="text-center text-[0.66rem] text-[var(--color-fg-subtle)] mb-2.5">
              {session ? "30-Day Money-Back Guarantee" : "Sign in to enroll"}
            </p>
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-[var(--color-border)] text-[0.68rem] text-[var(--color-fg-muted)]">
              <button onClick={onShare} className={cn("hover:text-[var(--color-fg)] flex items-center gap-1 transition-colors", shareCopied && "text-[var(--color-green)]")}>
                {shareCopied ? <CheckCheck size={10} /> : <Share2 size={10} />}
                {shareCopied ? "Copied!" : "Share"}
              </button>
              <button className="hover:text-[var(--color-fg)] flex items-center gap-1"><GraduationCap size={10} />Gift</button>
              <button onClick={onWishlist} className={cn("flex items-center gap-1 transition-colors", wishlist ? "text-[var(--color-brand)]" : "hover:text-[var(--color-fg)]")}>
                <BookMarked size={10} className={wishlist ? "fill-current" : ""} />
                {wishlist ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CurriculumSection ────────────────────────────────────────────────────────

function CurriculumSection({ course }: { course: Course }) {
  const [expanded,       setExpanded]       = useState<string | null>(null);
  const [showAll,        setShowAll]        = useState(false);
  const modules = course.modules ?? [];
  const visible = showAll ? modules : modules.slice(0, 5);
  const totalLessons   = modules.reduce((s, m) => s + m.lessons.length, 0);
  const totalDurSecs   = modules.reduce((s, m) => s + m.lessons.reduce((ls, l) => ls + (l.duration ?? 0), 0), 0);
  const totalDurLabel  = fmtDuration(totalDurSecs);

  if (modules.length === 0) {
    return (
      <div className="mb-5">
        <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2.5" style={{ fontFamily: "var(--font-display)" }}>Course content</h2>
        <p className="text-[0.8rem] text-[var(--color-fg-muted)] italic">Curriculum coming soon.</p>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)]" style={{ fontFamily: "var(--font-display)" }}>Course content</h2>
        <span className="text-[0.65rem] text-[var(--color-fg-muted)]">
          {modules.length} sections · {totalLessons} lessons{totalDurLabel ? ` · ${totalDurLabel}` : ""}
        </span>
      </div>
      <div className="border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)]">
        {visible.map((mod) => (
          <div key={mod.id} className="bg-[var(--color-surface)]">
            <button onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--color-surface-2)] transition-colors">
              <div className="flex items-center gap-2">
                {expanded === mod.id ? <ChevronUp size={13} className="text-[var(--color-fg-muted)]" /> : <ChevronDown size={13} className="text-[var(--color-fg-muted)]" />}
                <span className="text-[0.78rem] font-semibold text-[var(--color-fg)]">{mod.title}</span>
              </div>
              <span className="text-[0.65rem] text-[var(--color-fg-subtle)] ml-3 whitespace-nowrap">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}</span>
            </button>
            <AnimatePresence>
              {expanded === mod.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-3 pb-2.5 space-y-1">
                    {mod.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-[var(--color-surface-2)]">
                        <div className="flex items-center gap-2">
                          {lesson.isFree ? <Play size={10} className="text-[var(--color-fg-subtle)]" /> : <Lock size={10} className="text-[var(--color-fg-subtle)]" />}
                          <span className="text-[0.72rem] text-[var(--color-fg-muted)]">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.duration && <span className="text-[0.62rem] text-[var(--color-fg-subtle)]">{fmtDuration(lesson.duration)}</span>}
                          {lesson.isFree && <span className="text-[0.58rem] font-semibold text-[var(--color-brand-light)] border border-[var(--color-border-brand)] px-1.5 py-0.5 rounded">Preview</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      {modules.length > 5 && (
        <button onClick={() => setShowAll(!showAll)} className="btn btn-outline w-full justify-center mt-2.5 text-[0.75rem] py-2">
          {showAll ? "Show less" : `Show all ${modules.length} sections`}
          {showAll ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const slug   = params.slug;

  const [course,   setCourse]   = useState<Course | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [bookmarked,    setBookmarked]    = useState(false);
  const [bookmarking,   setBookmarking]   = useState(false);
  const [shareCopied,   setShareCopied]   = useState(false);
  const [checkoutOpen,  setCheckoutOpen]  = useState(false);
  // Mobile enroll state
  const [mobileEnrolled,  setMobileEnrolled]  = useState(false);
  const [mobileEnrolling, setMobileEnrolling] = useState(false);
  const [mobileChecked,   setMobileChecked]   = useState(false);

  useEffect(() => {
    if (!slug) return;
    publicApi.getCourseBySlug(slug)
      .then((data) => { setCourse(data); setLoading(false); })
      .catch((e)   => { setError(e.message ?? "Course not found"); setLoading(false); });
  }, [slug]);

  // Load bookmark state once course + session are ready
  useEffect(() => {
    if (!course || sessionStatus === "loading" || !session) return;
    bookmarksApi.check(course.id)
      .then(({ bookmarked: bm }) => setBookmarked(bm))
      .catch(() => {});
  }, [course, session, sessionStatus]);

  async function handleToggleBookmark() {
    if (!course) return;
    if (!session) { router.push(`/login?callbackUrl=/courses/${course.slug}`); return; }
    if (bookmarking) return;
    setBookmarking(true);
    setBookmarked(prev => !prev);
    try {
      const res = await bookmarksApi.toggle(course.id);
      setBookmarked(res.bookmarked);
    } catch {
      setBookmarked(prev => !prev);
    } finally {
      setBookmarking(false);
    }
  }

  async function handleShare() {
    if (!course) return;
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/courses/${course.slug}`
      : `/courses/${course.slug}`;
    const shareData = {
      title: course.title,
      text:  `Check out "${course.title}" on CGS — ${course.subtitle ?? "a great tech course"}`,
      url,
    };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await navigator.share(shareData); return; } catch { /* cancelled */ }
    }
    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch { /* clipboard denied */ }
  }

  // Check mobile enrollment once course + session are ready
  useEffect(() => {
    if (!course || sessionStatus === "loading") return;
    if (!session) { setMobileChecked(true); return; }
    studentApi.checkEnrollment(course.id)
      .then(({ enrolled }) => setMobileEnrolled(enrolled))
      .catch(() => {})
      .finally(() => setMobileChecked(true));
  }, [course, session, sessionStatus]);

  async function handleMobileEnroll() {
    if (!course) return;
    if (!session) { router.push(`/login?callbackUrl=/courses/${course.slug}`); return; }
    setMobileEnrolling(true);
    try {
      await studentApi.enroll(course.id);
      router.push(`/courses/${course.slug}/learn`);
    } catch (e: unknown) {
      const msg = (e as Error).message ?? "";
      if (msg.toLowerCase().includes("already")) {
        router.push(`/courses/${course.slug}/learn`);
      } else {
        setMobileEnrolling(false);
      }
    }
  }

  if (loading) return <PageSkeleton />;

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center gap-4 p-8">
        <AlertCircle size={40} className="text-[var(--color-rose)]" />
        <p className="text-[var(--color-fg)] font-semibold text-lg">{error ?? "Course not found"}</p>
        <Link href="/courses" className="btn btn-outline gap-2"><ArrowLeft size={14} />All Courses</Link>
      </div>
    );
  }

  const sale  = paise(course.price);
  const orig  = course.originalPrice ? paise(course.originalPrice) : null;
  const disc  = orig && course.originalPrice && course.originalPrice > course.price
    ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
  const instructorName  = course.instructor?.name ?? "—";
  const instructorTitle = course.instructor?.instructorTitle ?? "";
  const instructorBio   = course.instructor?.instructorBio ?? "";
  const instructorImg   = course.instructor?.avatar ?? null;
  const totalLessons    = (course.modules ?? []).reduce((s, m) => s + m.lessons.length, 0);
  const totalDurSecs    = (course.modules ?? []).reduce((s, m) => s + m.lessons.reduce((ls, l) => ls + (l.duration ?? 0), 0), 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Navbar */}
      <header className="sticky top-0 z-50 py-2.5 backdrop-blur-xl border-b border-[var(--color-border)] bg-[var(--color-bg)]/90">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/courses" className="flex items-center gap-1.5 text-[0.8rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors">
              <ArrowLeft size={15} /><span className="hidden sm:inline">All Courses</span>
            </Link>
            <span className="w-px h-4 bg-[var(--color-border)] hidden sm:block" />
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-md bg-[var(--color-brand)] flex items-center justify-center">
                <BookOpen size={13} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-extrabold text-[0.9rem] hidden sm:inline" style={{ fontFamily: "var(--font-display)" }}><span className="text-grad">CGS</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              disabled={bookmarking}
              title={bookmarked ? "Remove bookmark" : "Bookmark this course"}
              className={cn(
                "w-8 h-8 rounded-md border flex items-center justify-center transition-all",
                bookmarked
                  ? "text-[var(--color-brand)] border-[var(--color-border-brand)] bg-[var(--color-brand-dim)]"
                  : "text-[var(--color-fg-muted)] border-[var(--color-border)] hover:text-[var(--color-brand)] hover:border-[var(--color-border-brand)]"
              )}
            >
              {bookmarking
                ? <Loader2 size={14} className="animate-spin" />
                : <Bookmark size={14} className={bookmarked ? "fill-current" : ""} />}
            </button>
            <button
              onClick={handleShare}
              title={shareCopied ? "Link copied!" : "Share this course"}
              className={cn(
                "w-8 h-8 rounded-md border flex items-center justify-center transition-all",
                shareCopied
                  ? "text-[var(--color-green)] border-[var(--color-green)]/30 bg-[rgba(52,211,153,0.1)]"
                  : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-2)]"
              )}
            >
              {shareCopied ? <CheckCheck size={14} /> : <Share2 size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* Dark hero banner */}
      <div className="bg-[#1a1a2e] border-b border-[var(--color-border)]">
        <div className="container py-4 sm:py-8 lg:pb-[70px]">
          <div className="lg:max-w-[calc(100%-380px)]">
            <div className="flex items-center gap-1.5 text-[0.7rem] text-[rgba(255,255,255,0.4)] mb-3 flex-wrap">
              <Link href="/" className="hover:text-[rgba(255,255,255,0.7)]">Home</Link><span>/</span>
              <Link href="/courses" className="hover:text-[rgba(255,255,255,0.7)]">Courses</Link><span>/</span>
              <span className="text-[rgba(255,255,255,0.6)]">{course.category}</span>
            </div>
            <h1 className="font-display font-black text-[clamp(1.6rem,4vw,2.4rem)] text-white tracking-tight leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {course.title}
            </h1>
            <p className="text-[0.92rem] text-[rgba(255,255,255,0.65)] leading-relaxed mb-3 max-w-[560px]">{course.description}</p>
            <div className="flex items-center gap-3 text-[0.85rem] flex-wrap mb-2">
              {course.featured && <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded bg-[var(--color-amber)] text-black">Bestseller</span>}
              {course.averageRating > 0 && (
                <span className="flex items-center gap-1.5 text-[var(--color-amber)] font-bold">
                  {course.averageRating.toFixed(1)}
                  <span className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={13} className={cn("fill-current", i < Math.floor(course.averageRating) ? "" : "opacity-30")} />)}</span>
                  <span className="text-[rgba(255,255,255,0.5)] font-normal underline ml-1">({course.totalReviews})</span>
                </span>
              )}
              {course.studentsEnrolled > 0 && <span className="text-[rgba(255,255,255,0.55)]">{course.studentsEnrolled.toLocaleString()}+ students</span>}
            </div>
            <div className="flex items-center gap-3 text-[0.82rem] text-[rgba(255,255,255,0.5)] flex-wrap mb-3">
              {instructorName !== "—" && <span>By <span className="text-[var(--color-brand-light)] underline">{instructorName}</span></span>}
              <span className="flex items-center gap-1.5"><Globe2 size={13} />Hindi + English</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {course.tag && <span className="tag text-[0.7rem] py-1 px-2.5">{course.tag}</span>}
              <span className={cn("text-[0.7rem] font-bold px-2.5 py-1 rounded-full border",
                course.level === "BEGINNER" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
                course.level === "INTERMEDIATE" && "bg-amber-500/10 text-amber-400 border-amber-500/25",
                course.level === "ADVANCED" && "bg-rose-500/10 text-rose-400 border-rose-500/25"
              )}>{course.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8">

          {/* Sticky enrollment card (desktop) */}
          <div className="hidden lg:block order-2 lg:-mt-[90px] lg:sticky lg:top-[76px] lg:self-start">
            <EnrollCard course={course} wishlist={bookmarked} onWishlist={handleToggleBookmark} onShare={handleShare} shareCopied={shareCopied} onCheckout={() => setCheckoutOpen(true)} courseId={course.id} />
          </div>

          {/* Left: all page content */}
          <div className="order-1 py-6">

            {/* What you'll learn */}
            {course.whatYouLearn.length > 0 && (
              <div className="border border-[var(--color-border)] rounded-xl p-4 mb-5">
                <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-3" style={{ fontFamily: "var(--font-display)" }}>What you&apos;ll learn</h2>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={13} className="flex-shrink-0 mt-0.5 text-[var(--color-brand)]" />
                      <span className="text-[0.75rem] text-[var(--color-fg-muted)] leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* This course includes */}
            <div className="mb-5">
              <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2.5" style={{ fontFamily: "var(--font-display)" }}>This course includes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  ...(totalDurSecs > 0 ? [{ icon: Video, text: `${fmtDuration(totalDurSecs)} video` }] : []),
                  ...(totalLessons > 0 ? [{ icon: FileText, text: `${totalLessons} lessons` }] : []),
                  ...(course.totalProjects > 0 ? [{ icon: Target, text: `${course.totalProjects} projects` }] : []),
                  { icon: Download, text: "Resources" },
                  { icon: Infinity, text: "Lifetime access" },
                  { icon: Award, text: "Certificate" },
                ].map(({ icon: I, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-[0.72rem] text-[var(--color-fg-muted)]">
                    <I size={13} className="text-[var(--color-fg-subtle)]" />{text}
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <CurriculumSection course={course} />

            {/* Requirements */}
            {course.prerequisites.length > 0 && (
              <div className="mb-5">
                <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Requirements</h2>
                <ul className="space-y-1">
                  {course.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-[0.75rem] text-[var(--color-fg-muted)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-fg-muted)] mt-[6px] flex-shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {(course.longDescription || course.highlights.length > 0) && (
              <div className="mb-5">
                <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Description</h2>
                {course.longDescription && <p className="text-[0.78rem] text-[var(--color-fg-muted)] leading-[1.65] mb-2.5">{course.longDescription}</p>}
                {course.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {course.highlights.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[0.65rem] text-[var(--color-fg-muted)]">
                        <Sparkles size={8} style={{ color: course.accentColor || "#7c6fff" }} />{h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Instructor */}
            {instructorName !== "—" && (
              <div className="mb-5">
                <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2.5" style={{ fontFamily: "var(--font-display)" }}>Instructor</h2>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--color-border)] bg-[var(--color-surface-2)]">
                    {instructorImg
                      ? <Image src={instructorImg} alt={instructorName} width={56} height={56} className="object-cover w-full h-full" />
                      : <div className="w-full h-full flex items-center justify-center text-xl font-black text-[var(--color-brand-light)]">{instructorName[0]}</div>}
                  </div>
                  <div>
                    <p className="text-[0.84rem] font-semibold text-[var(--color-brand-light)] mb-0.5">{instructorName}</p>
                    {instructorTitle && <p className="text-[0.72rem] text-[var(--color-fg-muted)] mb-1">{instructorTitle}</p>}
                    {instructorBio && <p className="text-[0.74rem] text-[var(--color-fg-muted)] leading-relaxed">{instructorBio}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <Suspense fallback={<ReviewsSectionSkeleton />}>
              <ReviewsSection rating={course.averageRating > 0 ? course.averageRating.toFixed(1) : "—"} reviewsData={[]} />
            </Suspense>

          </div>
        </div>
      </div>

      <Footer />

      {/* Checkout modal */}
      {course && (
        <CheckoutModal
          course={course}
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onEnrolled={() => {
            setCheckoutOpen(false);
            router.push(`/courses/${course.slug}/learn`);
          }}
        />
      )}

      {/* Mobile sticky enroll bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-t border-[var(--color-border-2)] shadow-[0_-8px_32px_rgba(0,0,0,0.4)] px-4 py-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-[1.1rem] text-[var(--color-fg)] leading-none" style={{ fontFamily: "var(--font-display)" }}>{sale}</span>
              {orig && <span className="text-[0.66rem] text-[var(--color-fg-subtle)] line-through">{orig}</span>}
            </div>
            {disc > 0 && <p className="text-[0.6rem] text-rose-300">{disc}% off</p>}
          </div>
          {mobileEnrolled ? (
            <Link href={`/courses/${course.slug}/learn`}
              className="btn btn-brand flex-1 justify-center py-2.5 px-3 text-[0.78rem] font-bold gap-2">
              <BookMarked size={14} /> Continue
            </Link>
          ) : (
            <button onClick={() => session ? setCheckoutOpen(true) : router.push(`/login?callbackUrl=/courses/${course.slug}`)}
              disabled={mobileEnrolling || !mobileChecked}
              className="btn btn-brand flex-1 justify-center py-2.5 px-3 text-[0.78rem] font-bold disabled:opacity-70">
              {mobileEnrolling ? <Loader2 size={14} className="animate-spin" /> : "Enroll Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
