"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Clock, Users, Star, ArrowRight, ArrowLeft, Code2, Globe, Layers, Brain,
  Smartphone, Server, Settings, Monitor, Sparkles, Search, BookOpen,
  CheckCircle, Play, X, BarChart2, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { publicApi, type Course } from "@/lib/api";
import Footer from "@/components/Footer";
import { CourseGridSkeleton } from "@/components/Skeleton";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function paise(n: number) {
  return `₹${Math.round(n / 100).toLocaleString("en-IN")}`;
}

function iconForCategory(cat: string) {
  const m: Record<string, React.ElementType> = {
    "Web Development": Globe, "Mobile Development": Smartphone,
    "Data Science": Brain, "Machine Learning": Brain,
    "DevOps": Settings, "Cybersecurity": Monitor,
    "System Design": Layers, "DSA": Code2,
    "Cloud Computing": Server, "Backend": Server,
  };
  return m[cat] ?? Layers;
}

const LEVELS = ["All Levels", "BEGINNER", "INTERMEDIATE", "ADVANCED"];
const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
};
const LEVEL_COLOR: Record<string, string> = {
  BEGINNER: "bg-emerald-500/20 text-emerald-200",
  INTERMEDIATE: "bg-amber-500/20 text-amber-200",
  ADVANCED: "bg-rose-500/20 text-rose-200",
};

// ─── SpotlightCard ────────────────────────────────────────────────────────────

function SpotlightCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
    ref.current.style.setProperty("--spotlight", "rgba(124,111,255,0.12)");
  }, []);
  const onLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty("--mx", "-999px");
    ref.current.style.setProperty("--my", "-999px");
  }, []);
  return (
    <motion.div
      ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: "easeOut" }}
      className="spotlight-card course-card flex flex-col h-full group"
    >
      {children}
    </motion.div>
  );
}

// ─── CourseCard ───────────────────────────────────────────────────────────────

function CourseCard({ course, index }: { course: Course; index: number }) {
  const Icon = iconForCategory(course.category);
  const gradient = course.gradient || "from-indigo-600/80 to-purple-700/90";
  const accent   = course.accentColor || "#7c6fff";
  const img      = course.thumbnail || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop&auto=format&q=80";
  const salePrice = paise(course.price);
  const origPrice = course.originalPrice ? paise(course.originalPrice) : null;
  const discount  = origPrice && course.originalPrice && course.originalPrice > course.price
    ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
  const instructorName = course.instructor?.name ?? "—";

  return (
    <SpotlightCard index={index}>
      {/* Thumbnail */}
      <div className="relative h-[155px] overflow-hidden rounded-t-[19px]">
        <Image src={img} alt={course.title} fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-65 transition-opacity duration-500 group-hover:opacity-50", gradient)} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {course.tag && (
            <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-black/30 border border-white/20 text-white shadow-lg">
              {course.tag}
            </span>
          )}
          {course.featured && (
            <span className="flex items-center gap-1 text-[0.6rem] font-bold px-2 py-1 rounded-full bg-[var(--color-brand)] text-white shadow-lg">
              <Star size={9} className="fill-current" /> BEST SELLER
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className={cn("text-[0.62rem] font-bold px-2 py-1 rounded-full backdrop-blur-sm border border-white/15",
            LEVEL_COLOR[course.level] ?? "bg-white/10 text-white/80")}>
            {LEVEL_LABEL[course.level] ?? course.level}
          </span>
        </div>
        <div className="absolute bottom-3 right-4 w-10 h-10 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon size={18} className="text-white" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
            <Play size={18} className="text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 pt-3 bg-[var(--color-surface)]">
        <h3 className="font-display font-extrabold text-[0.92rem] text-[var(--color-fg)] mb-0.5 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          {course.title}
        </h3>
        {course.subtitle && <p className="text-[0.68rem] font-semibold mb-2" style={{ color: accent }}>{course.subtitle}</p>}
        <p className="text-[0.66rem] text-[var(--color-fg-subtle)] mb-2.5 flex items-center gap-1">
          <Users size={8} className="text-[var(--color-fg-muted)]" /> by {instructorName}
        </p>
        <p className="text-[0.76rem] text-[var(--color-fg-muted)] leading-relaxed mb-3 flex-1 line-clamp-2">
          {course.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { val: course.totalModules || "—", label: "Modules" },
            { val: course.totalProjects || "—", label: "Projects" },
            { val: course.duration, label: "Duration" },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center p-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <span className="text-[0.72rem] font-bold text-[var(--color-fg)] truncate max-w-full">{val}</span>
              <span className="text-[0.57rem] text-[var(--color-fg-subtle)]">{label}</span>
            </div>
          ))}
        </div>

        {/* Highlights */}
        {course.highlights.length > 0 && (
          <ul className="flex flex-col gap-1 mb-3">
            {course.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex items-center gap-1.5 text-[0.7rem] text-[var(--color-fg-muted)]">
                <CheckCircle size={11} className="flex-shrink-0" style={{ color: accent }} /> {h}
              </li>
            ))}
          </ul>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2.5 text-[0.67rem] text-[var(--color-fg-subtle)] mb-3 flex-wrap">
          {course.studentsEnrolled > 0 && <span className="flex items-center gap-1"><Users size={10} /> {course.studentsEnrolled.toLocaleString()}+</span>}
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1 text-[var(--color-amber)]">
              <Star size={10} className="fill-current" /> {course.averageRating.toFixed(1)}
              <span className="text-[var(--color-fg-subtle)]">({course.totalReviews})</span>
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="pt-3 border-t border-[var(--color-border)] mt-auto">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="font-display font-extrabold text-[1.05rem] text-[var(--color-fg)]" style={{ fontFamily: "var(--font-display)" }}>{salePrice}</span>
            {origPrice && <span className="text-[0.7rem] text-[var(--color-fg-subtle)] line-through">{origPrice}</span>}
            {discount > 0 && (
              <span className="ml-auto text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md bg-[var(--color-brand-dim)] text-[var(--color-brand)] border border-[var(--color-border-brand)]">
                {discount}% off
              </span>
            )}
          </div>
          <Link href={`/courses/${course.slug}`}
            className={cn("w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[0.76rem] font-semibold transition-all duration-200",
              course.featured ? "btn btn-brand" : "btn btn-outline")}>
            View Course <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [courses,       setCourses]       = useState<Course[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [activeLevel,   setActiveLevel]   = useState("All Levels");
  const [sortBy, setSortBy] = useState<"popular" | "price-low" | "price-high" | "rating">("popular");
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    publicApi.getCourses()
      .then((data) => { setCourses(data); setLoading(false); })
      .catch((e) => { setError(e.message ?? "Failed to load courses"); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let r = [...courses];
    if (activeLevel !== "All Levels") r = r.filter((c) => c.level === activeLevel);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle ?? "").toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }
    switch (sortBy) {
      case "price-low":  r.sort((a, b) => a.price - b.price); break;
      case "price-high": r.sort((a, b) => b.price - a.price); break;
      case "rating":     r.sort((a, b) => b.averageRating - a.averageRating); break;
      default:           r.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }
    return r;
  }, [courses, activeLevel, searchQuery, sortBy]);

  return (
    <div className="page-wrap mesh-bg noise-overlay min-h-screen">

      {/* Navbar */}
      <header className="sticky top-0 z-50 py-4 backdrop-blur-xl border-b border-[var(--color-border)] bg-[var(--color-bg)]/85">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Home">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center shadow-lg shadow-[var(--color-brand-glow)] group-hover:scale-105 transition-transform">
                <BookOpen size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-extrabold text-[1.15rem] tracking-[-0.03em]" style={{ fontFamily: "var(--font-display)" }}>
                <span className="text-grad">CGS</span>
              </span>
            </Link>
            <span className="hidden sm:block w-px h-6 bg-[var(--color-border)]" />
            <span className="hidden sm:block text-[0.84rem] font-semibold text-[var(--color-fg-muted)]">All Courses</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn btn-ghost text-[0.82rem] py-2 px-3 sm:px-4 gap-1.5">
              <ArrowLeft size={14} /><span className="hidden sm:inline">Back to Home</span>
            </Link>
            <Link href="/#contact" className="btn btn-brand text-[0.82rem] py-[9px] px-5 hidden sm:inline-flex">
              Start Learning
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,111,255,0.08), transparent 60%)" }} />
        <div className="container relative z-10" ref={heroRef}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-[700px] mx-auto">
            <span className="section-label justify-center">
              <span className="w-5 h-px bg-[var(--color-brand)]" /> Explore All Courses <span className="w-5 h-px bg-[var(--color-brand)]" />
            </span>
            <h1 className="font-display font-black text-[clamp(2.4rem,5vw,3.6rem)] text-[var(--color-fg)] tracking-[-0.04em] leading-[1.05] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Level Up Your <span className="text-grad">Tech Career</span>
            </h1>
            <p className="text-[clamp(0.88rem,1.4vw,1rem)] text-[var(--color-fg-muted)] leading-relaxed mb-8">
              Industry-leading courses designed for real placements — from beginner to production-ready.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="max-w-[560px] mx-auto">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
              <input type="text" placeholder="Search courses — DSA, React, Python, DevOps..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-11 pr-10 py-[14px] text-[0.9rem] rounded-2xl bg-[var(--color-surface)] border-[var(--color-border-2)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="pb-20">
        <div className="container">

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
            {/* Level pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0">
              {LEVELS.map((lvl) => (
                <button key={lvl} onClick={() => setActiveLevel(lvl)}
                  className={cn("px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold transition-all whitespace-nowrap",
                    activeLevel === lvl ? "bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]")}>
                  {lvl === "All Levels" ? "All" : LEVEL_LABEL[lvl]}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input py-2 px-3 text-[0.78rem] rounded-xl w-auto min-w-[160px] max-w-[200px] shrink-0 cursor-pointer bg-[var(--color-surface)] border-[var(--color-border)]">
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>

          {/* Count + clear */}
          <div className="flex items-center gap-2 mb-6">
            <p className="text-[0.82rem] text-[var(--color-fg-muted)]">
              Showing <span className="font-semibold text-[var(--color-fg)]">{loading ? "…" : filtered.length}</span> course{filtered.length !== 1 ? "s" : ""}
              {searchQuery && <span> for &ldquo;<span className="text-[var(--color-brand-light)]">{searchQuery}</span>&rdquo;</span>}
            </p>
            {(searchQuery || activeLevel !== "All Levels") && (
              <button onClick={() => { setSearchQuery(""); setActiveLevel("All Levels"); }}
                className="text-[0.75rem] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition-colors">
                Clear filters
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/10 px-5 py-4 text-[var(--color-rose)] text-sm mb-6">
              {error} — <button onClick={() => { setLoading(true); setError(null); publicApi.getCourses().then(setCourses).catch((e) => setError(e.message)).finally(() => setLoading(false)); }} className="underline underline-offset-2">retry</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <CourseGridSkeleton count={6} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${activeLevel}-${sortBy}-${searchQuery}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                <Search size={24} className="text-[var(--color-fg-subtle)]" />
              </div>
              <p className="text-[1.05rem] font-semibold text-[var(--color-fg)] mb-2">No courses found</p>
              <p className="text-[0.88rem] text-[var(--color-fg-muted)] max-w-[360px]">Try adjusting your search or filters.</p>
              <button onClick={() => { setSearchQuery(""); setActiveLevel("All Levels"); }}
                className="btn btn-outline mt-5 text-[0.84rem] py-[10px] px-5">Reset Filters</button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
