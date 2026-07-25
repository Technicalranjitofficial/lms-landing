"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Play, Lock, CheckCircle, Clock, FileText,
  Loader2, AlertCircle, Menu, X, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  publicApi, studentApi, lessonProgressApi,
  type Course, type CourseLesson,
} from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(seconds?: number) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlatLesson extends CourseLesson {
  moduleTitle: string;
  moduleIndex: number;
  lessonIndex: number;
  globalIndex: number;
}

interface ProgressEntry {
  watchedSeconds: number;
  completed: boolean;
}

function flattenLessons(course: Course): FlatLesson[] {
  const flat: FlatLesson[] = [];
  let g = 0;
  (course.modules ?? []).forEach((mod, mi) => {
    mod.lessons.forEach((lesson, li) => {
      flat.push({ ...lesson, moduleTitle: mod.title, moduleIndex: mi, lessonIndex: li, globalIndex: g++ });
    });
  });
  return flat;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ course, activeId, onSelect, completedIds }: {
  course: Course;
  activeId: string | null;
  onSelect: (lesson: FlatLesson) => void;
  completedIds: Set<string>;
}) {
  const [openModules, setOpenModules] = useState<Set<number>>(() => new Set([0]));

  function toggleModule(idx: number) {
    setOpenModules(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  let globalIdx = 0;

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="px-4 py-3.5 border-b border-[var(--color-border)] shrink-0">
        <Link href={`/courses/${course.slug}`}
          className="flex items-center gap-2 text-[0.78rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors mb-2">
          <ArrowLeft size={13} /> Course overview
        </Link>
        <h2 className="font-display font-bold text-[0.88rem] text-[var(--color-fg)] leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)" }}>
          {course.title}
        </h2>
        <div className="flex items-center gap-3 mt-1.5 text-[0.68rem] text-[var(--color-fg-muted)]">
          <span>{(course.modules ?? []).length} modules</span>
          <span>{(course.modules ?? []).reduce((s, m) => s + m.lessons.length, 0)} lessons</span>
        </div>
        {/* Progress bar */}
        {completedIds.size > 0 && (() => {
          const total = (course.modules ?? []).reduce((s, m) => s + m.lessons.length, 0);
          const pct   = total > 0 ? Math.round((completedIds.size / total) * 100) : 0;
          return (
            <div className="mt-2">
              <div className="flex justify-between text-[0.62rem] text-[var(--color-fg-muted)] mb-1">
                <span>{pct}% complete</span>
                <span>{completedIds.size}/{total}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-cyan)] transition-all duration-500"
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        {(course.modules ?? []).map((mod, mi) => {
          const isOpen = openModules.has(mi);
          const modCompleted = mod.lessons.every(l => completedIds.has(l.id));
          return (
            <div key={mod.id} className="border-b border-[var(--color-border)]">
              {/* Module header */}
              <button onClick={() => toggleModule(mi)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-[var(--color-surface-2)] transition-colors">
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[0.55rem] font-black",
                  modCompleted ? "bg-[var(--color-brand)] text-white" : "bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]")}>
                  {modCompleted ? <CheckCircle size={11} /> : mi + 1}
                </div>
                <span className="flex-1 text-[0.78rem] font-semibold text-[var(--color-fg)] leading-snug">{mod.title}</span>
                <span className="text-[0.62rem] text-[var(--color-fg-subtle)] shrink-0 mr-1">{mod.lessons.length}</span>
                {isOpen ? <ChevronUp size={13} className="text-[var(--color-fg-subtle)] shrink-0" /> : <ChevronDown size={13} className="text-[var(--color-fg-subtle)] shrink-0" />}
              </button>

              {/* Lessons */}
              {isOpen && (
                <div className="bg-[var(--color-surface-2)]">
                  {mod.lessons.map((lesson) => {
                    const gi = globalIdx++;
                    const isActive = lesson.id === activeId;
                    const isDone   = completedIds.has(lesson.id);
                    const flat: FlatLesson = { ...lesson, moduleTitle: mod.title, moduleIndex: mi, lessonIndex: gi, globalIndex: gi };
                    return (
                      <button key={lesson.id} onClick={() => onSelect(flat)}
                        className={cn(
                          "w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors border-l-2",
                          isActive
                            ? "border-l-[var(--color-brand)] bg-[var(--color-brand-dim)]"
                            : "border-l-transparent hover:bg-[var(--color-surface-3)]"
                        )}>
                        <div className="mt-0.5 shrink-0">
                          {isDone
                            ? <CheckCircle size={14} className="text-[var(--color-brand)]" />
                            : <Play size={14} className={isActive ? "text-[var(--color-brand-light)]" : "text-[var(--color-fg-subtle)]"} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[0.74rem] leading-snug",
                            isActive ? "font-semibold text-[var(--color-brand-light)]" : "text-[var(--color-fg-muted)]")}>
                            {lesson.title}
                          </p>
                          {lesson.duration && (
                            <span className="text-[0.62rem] text-[var(--color-fg-subtle)] flex items-center gap-1 mt-0.5">
                              <Clock size={9} /> {fmtDuration(lesson.duration)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LessonContent ────────────────────────────────────────────────────────────

interface LessonContentProps {
  lesson: FlatLesson;
  course: Course;
  enrollmentId: string | null;
  initialWatchedSeconds: number;
  onProgress: (seconds: number, completed: boolean) => void;
  onComplete: () => void;
  isCompleted: boolean;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function LessonContent({
  lesson, course, enrollmentId, initialWatchedSeconds,
  onProgress, onComplete, isCompleted, onPrev, onNext, hasPrev, hasNext,
}: LessonContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Bunny Player.js integration
  useEffect(() => {
    if (!lesson.videoId || !enrollmentId) return;

    // Load Bunny Player.js SDK once
    if (!document.getElementById("bunny-player-js")) {
      const s = document.createElement("script");
      s.id = "bunny-player-js";
      s.src = "https://player.mediadelivery.net/player.js";
      document.head.appendChild(s);
    }

    // Wait for SDK + iframe to be ready
    const timer = setTimeout(() => {
      if (!iframeRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const playerjs = (window as any).playerjs;
      if (!playerjs) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const player = new playerjs.Player(iframeRef.current);

      let saveTimer: ReturnType<typeof setTimeout> | null = null;
      let currentSeconds = initialWatchedSeconds;

      player.on("timeupdate", ({ seconds }: { seconds: number }) => {
        currentSeconds = Math.floor(seconds);
        // Debounce: save every 10s
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          onProgress(currentSeconds, false);
        }, 10_000);
      });

      player.on("ended", () => {
        if (saveTimer) clearTimeout(saveTimer);
        onProgress(currentSeconds, true); // auto-complete on video end
      });

      // Seek to resume position (skip if near start)
      if (initialWatchedSeconds > 5) {
        player.setCurrentTime(initialWatchedSeconds);
      }

      return () => {
        if (saveTimer) clearTimeout(saveTimer);
      };
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.videoId, lesson.id, enrollmentId, initialWatchedSeconds]);

  const totalLessons = (course.modules ?? []).reduce((s, m) => s + m.lessons.length, 0);

  // Watch progress percentage for the progress bar
  const watchPct = lesson.duration && lesson.duration > 0
    ? Math.min(100, Math.round((initialWatchedSeconds / lesson.duration) * 100))
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Video area */}
        <div className="aspect-video w-full bg-black relative">
          {lesson.videoId ? (
            <iframe
              ref={iframeRef}
              src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${lesson.videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
              className="w-full h-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <FileText size={28} className="text-white/40" />
              </div>
              <p className="text-white/60 text-sm">No video for this lesson yet</p>
            </div>
          )}
        </div>

        {/* Watch progress bar (only when video exists and has duration) */}
        {lesson.videoId && lesson.duration && lesson.duration > 0 && !isCompleted && (
          <div className="h-1 bg-[var(--color-surface-3)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-cyan)] transition-all duration-500"
              style={{ width: `${watchPct}%` }}
            />
          </div>
        )}
        {/* Completed = full green bar */}
        {isCompleted && (
          <div className="h-1 bg-[var(--color-brand)] opacity-60" />
        )}

        {/* Lesson info */}
        <div className="px-6 py-5 max-w-3xl">
          <div className="flex items-center gap-2 text-[0.72rem] text-[var(--color-fg-muted)] mb-2">
            <span>{lesson.moduleTitle}</span>
            <span>·</span>
            <span>Lesson {lesson.lessonIndex + 1}</span>
            {lesson.duration && (
              <><span>·</span><span className="flex items-center gap-1"><Clock size={10} />{fmtDuration(lesson.duration)}</span></>
            )}
          </div>
          <h1 className="font-display font-bold text-xl text-[var(--color-fg)] mb-4"
            style={{ fontFamily: "var(--font-display)" }}>
            {lesson.title}
          </h1>

          {/* Mark complete / completed badge */}
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--color-brand)]/30 bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]">
              <CheckCircle size={15} className="text-[var(--color-brand)]" />
              ✓ Completed
            </div>
          ) : (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-[var(--color-border-2)] text-[var(--color-fg-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-light)] hover:bg-[var(--color-brand-dim)]"
            >
              <CheckCircle size={15} />
              Mark as complete
            </button>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-[var(--color-border)] px-6 py-3 flex items-center justify-between shrink-0 bg-[var(--color-surface)]">
        <button onClick={onPrev} disabled={!hasPrev}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-[0.72rem] text-[var(--color-fg-subtle)]">
          {lesson.globalIndex + 1} / {totalLessons}
        </span>
        <button onClick={onNext} disabled={!hasNext}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const params  = useParams<{ slug: string }>();
  const router  = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const slug = params.slug;

  const [course,        setCourse]        = useState<Course | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [authError,     setAuthError]     = useState<string | null>(null);
  const [activeLesson,  setActiveLesson]  = useState<FlatLesson | null>(null);
  const [enrollmentId,  setEnrollmentId]  = useState<string | null>(null);
  const [progressMap,   setProgressMap]   = useState<Record<string, ProgressEntry>>({});
  const [completedIds,  setCompletedIds]  = useState<Set<string>>(new Set());
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  // Load course, verify enrollment, load progress
  useEffect(() => {
    if (!slug || sessionStatus === "loading") return;

    if (!session) {
      router.replace(`/login?callbackUrl=/courses/${slug}/learn`);
      return;
    }

    (async () => {
      try {
        const data = await publicApi.getCourseBySlug(slug);

        // Guard: must be enrolled
        const { enrolled, enrollment } = await studentApi.checkEnrollment(data.id);
        if (!enrolled || !enrollment) {
          router.replace(`/courses/${slug}`);
          return;
        }

        const eid = enrollment.id;
        setEnrollmentId(eid);
        setCourse(data);

        // Load persisted progress
        let pMap: Record<string, ProgressEntry> = {};
        try {
          const records = await lessonProgressApi.getByEnrollment(eid);
          pMap = Object.fromEntries(
            records.map(r => [r.lessonId, { watchedSeconds: r.watchedSeconds, completed: r.completed }])
          );
        } catch {
          // Non-critical — progress load failure doesn't block the page
        }
        setProgressMap(pMap);

        // Seed completedIds from persisted data
        const doneSet = new Set(
          Object.entries(pMap)
            .filter(([, v]) => v.completed)
            .map(([k]) => k)
        );
        setCompletedIds(doneSet);

        // Auto-select lesson: prefer lastLessonId, fallback to first
        const flat = flattenLessons(data);
        const resumeLesson = enrollment.lastLessonId
          ? flat.find(l => l.id === enrollment.lastLessonId) ?? flat[0]
          : flat[0];
        if (resumeLesson) setActiveLesson(resumeLesson);

        setLoading(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load course";
        setAuthError(msg);
        setLoading(false);
      }
    })();
  }, [slug, session, sessionStatus, router]);

  function handleSelect(lesson: FlatLesson) {
    setActiveLesson(lesson);
    setSidebarOpen(false);
  }

  // Persists progress to backend and updates local state
  const handleProgress = useCallback(async (lessonId: string, seconds: number, completed: boolean) => {
    if (!enrollmentId) return;

    // Optimistic local update for watched seconds
    setProgressMap(prev => ({
      ...prev,
      [lessonId]: {
        watchedSeconds: seconds,
        completed: completed || prev[lessonId]?.completed || false,
      },
    }));

    if (completed) {
      setCompletedIds(prev => new Set([...prev, lessonId]));
    }

    try {
      await lessonProgressApi.upsert({ lessonId, enrollmentId, watchedSeconds: seconds, completed });
    } catch {
      // Best-effort — fail silently so video playback is never interrupted
    }
  }, [enrollmentId]);

  // Manual mark-complete: always sends completed: true
  const handleComplete = useCallback(async () => {
    if (!activeLesson || !enrollmentId) return;
    await handleProgress(
      activeLesson.id,
      progressMap[activeLesson.id]?.watchedSeconds ?? 0,
      true,
    );
  }, [activeLesson, enrollmentId, progressMap, handleProgress]);

  function navigate(dir: 1 | -1) {
    if (!course || !activeLesson) return;
    const flat = flattenLessons(course);
    const next = flat.find(l => l.globalIndex === activeLesson.globalIndex + dir);
    if (next) setActiveLesson(next);
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-brand-dim)] flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-[var(--color-brand)]" />
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">Loading your course…</p>
        </div>
      </div>
    );
  }

  if (authError || !course) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center gap-4 p-8">
        <AlertCircle size={40} className="text-[var(--color-rose)]" />
        <p className="text-[var(--color-fg)] font-semibold">{authError ?? "Course not found"}</p>
        <Link href="/courses" className="btn btn-outline gap-2"><ArrowLeft size={14} />All Courses</Link>
      </div>
    );
  }

  const flat    = flattenLessons(course);
  const hasPrev = !!activeLesson && activeLesson.globalIndex > 0;
  const hasNext = !!activeLesson && activeLesson.globalIndex < flat.length - 1;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">

      {/* Top bar */}
      <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4 gap-3 shrink-0 z-50 relative">
        {/* Mobile sidebar toggle */}
        <button onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden p-1.5 rounded-lg text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors">
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[var(--color-brand)] flex items-center justify-center">
            <BookOpen size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-extrabold text-[0.88rem] hidden sm:inline text-grad"
            style={{ fontFamily: "var(--font-display)" }}>CGS</span>
        </Link>

        <span className="w-px h-5 bg-[var(--color-border)] hidden sm:block" />

        <p className="text-[0.82rem] font-semibold text-[var(--color-fg)] truncate flex-1 hidden sm:block">
          {course.title}
        </p>

        {/* Progress chip */}
        {flat.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-28 h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-cyan)]"
                style={{ width: `${Math.round((completedIds.size / flat.length) * 100)}%` }} />
            </div>
            <span className="text-[0.7rem] text-[var(--color-fg-muted)]">
              {completedIds.size}/{flat.length}
            </span>
          </div>
        )}

        <Link href={`/courses/${slug}`}
          className="ml-auto text-[0.75rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors shrink-0 flex items-center gap-1.5">
          <ArrowLeft size={13} /><span className="hidden sm:inline">Overview</span>
        </Link>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            {/* Full-screen dark backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

            {/* Sidebar drawer — slides in from left, max 85vw so right edge always visible */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-[var(--color-surface)] border-r border-[var(--color-border)] overflow-hidden z-50 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer header — close button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-surface)]">
                <p className="text-[0.78rem] font-semibold text-[var(--color-fg)]">Course Content</p>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Sidebar
                  course={course}
                  activeId={activeLesson?.id ?? null}
                  onSelect={handleSelect}
                  completedIds={completedIds}
                />
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 overflow-hidden">
          <Sidebar course={course} activeId={activeLesson?.id ?? null} onSelect={handleSelect} completedIds={completedIds} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-[var(--color-bg)]">
          {activeLesson ? (
            <LessonContent
              lesson={activeLesson}
              course={course}
              enrollmentId={enrollmentId}
              initialWatchedSeconds={progressMap[activeLesson.id]?.watchedSeconds ?? 0}
              onProgress={(seconds, completed) => handleProgress(activeLesson.id, seconds, completed)}
              onComplete={handleComplete}
              isCompleted={completedIds.has(activeLesson.id)}
              onPrev={() => navigate(-1)}
              onNext={() => navigate(1)}
              hasPrev={hasPrev}
              hasNext={hasNext}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
              <BookOpen size={36} className="text-[var(--color-fg-subtle)]" />
              <p className="text-[var(--color-fg-muted)] text-sm">Select a lesson from the sidebar to begin</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
