"use client";

import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Clock, Users, Star, ArrowRight, Code2, Globe, Layers, Brain,
  Smartphone, Server, Settings, Monitor, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { publicApi, type Course } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function discountPct(price: number, original?: number) {
  if (!original || original <= price) return 0;
  return Math.round((1 - price / original) * 100);
}

// ─── Category tabs (derived from live data, shown statically) ─────────────────

const STATIC_CATS = [
  { id: "all",         label: "All Courses",   icon: Sparkles },
  { id: "DSA",         label: "DSA",           icon: Code2    },
  { id: "Web Development", label: "Web Dev",   icon: Globe    },
  { id: "Machine Learning", label: "AI & ML",  icon: Brain    },
  { id: "DevOps",      label: "DevOps & Cloud",icon: Server   },
];

// ─── SpotlightCard ────────────────────────────────────────────────────────────

function SpotlightCard({ children, featured, index }: {
  children: React.ReactNode; featured?: boolean; index: number;
}) {
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
      initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: index * 0.06, ease: "easeOut" }}
      className={cn(
        "spotlight-card course-card flex flex-col h-full group",
        featured && "ring-1 ring-[var(--color-brand)]/30 shadow-[0_0_40px_rgba(124,111,255,0.1)]"
      )}
    >
      {children}
    </motion.div>
  );
}

// ─── Regular course card ──────────────────────────────────────────────────────

function CourseCard({ course, index }: { course: Course; index: number }) {
  const Icon     = iconForCategory(course.category);
  const gradient = course.gradient || "from-indigo-600/80 to-purple-700/90";
  const accent   = course.accentColor || "#7c6fff";
  const img      = course.thumbnail || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop&auto=format&q=80";
  const disc     = discountPct(course.price, course.originalPrice);

  return (
    <SpotlightCard featured={course.featured} index={index}>
      {/* Thumbnail */}
      <div className="relative h-[150px] sm:h-[140px] overflow-hidden rounded-t-[19px]">
        <Image src={img} alt={course.title} fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity duration-500 group-hover:opacity-60", gradient)} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3">
          {course.tag && (
            <span className="text-[0.63rem] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/15 border border-white/20 text-white shadow-lg">
              {course.tag}
            </span>
          )}
        </div>
        {course.featured && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[0.6rem] font-bold px-2 py-1 rounded-full bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand-glow)]">
              <Star size={9} className="fill-current" /> BEST SELLER
            </span>
          </div>
        )}
        <div className="absolute bottom-3 right-4 w-10 h-10 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon size={18} className="text-white" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 pt-3 bg-[var(--color-surface)]">
        <h3 className="font-display font-extrabold text-[0.92rem] text-[var(--color-fg)] mb-0.5 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          {course.title}
        </h3>
        <p className="text-[0.68rem] font-semibold mb-2.5" style={{ color: accent }}>{course.subtitle}</p>
        <p className="text-[0.75rem] text-[var(--color-fg-muted)] leading-relaxed mb-3 flex-1 line-clamp-2">{course.description}</p>

        {/* Highlights */}
        <ul className="flex flex-col gap-1 mb-3">
          {course.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-center gap-1.5 text-[0.7rem] text-[var(--color-fg-muted)]">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="flex-shrink-0" style={{ color: accent }}>
                <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeOpacity="0.3" />
                <path d="M3.5 6L5 7.5L8.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {h}
            </li>
          ))}
        </ul>

        {/* Meta */}
        <div className="flex items-center gap-2.5 text-[0.67rem] text-[var(--color-fg-subtle)] mb-3 flex-wrap">
          <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>
          {course.studentsEnrolled > 0 && <span className="flex items-center gap-1"><Users size={10} /> {course.studentsEnrolled.toLocaleString()}+</span>}
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1 text-[var(--color-amber)]">
              <Star size={10} className="fill-current" /> {course.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="pt-3 border-t border-[var(--color-border)] mt-auto">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="font-display font-extrabold text-[1.05rem] text-[var(--color-fg)]" style={{ fontFamily: "var(--font-display)" }}>
              {paise(course.price)}
            </span>
            {course.originalPrice && (
              <span className="text-[0.7rem] text-[var(--color-fg-subtle)] line-through">{paise(course.originalPrice)}</span>
            )}
            {disc > 0 && (
              <span className="ml-auto text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md bg-[var(--color-brand-dim)] text-[var(--color-brand)] border border-[var(--color-border-brand)]">
                {disc}% off
              </span>
            )}
          </div>
          <Link href={`/courses/${course.slug}`}
            className={cn("w-full flex items-center justify-center gap-2 py-[9px] rounded-xl text-[0.78rem] font-semibold transition-all duration-200",
              course.featured ? "btn btn-brand" : "btn btn-outline")}>
            {course.tag === "Coming Soon" ? "Join Waitlist" : "View Course"} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}

// ─── Featured hero card (first/featured course) ───────────────────────────────

function FeaturedCard({ course }: { course: Course }) {
  const img    = course.thumbnail || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop&auto=format&q=80";
  const disc   = discountPct(course.price, course.originalPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
      className="mb-10"
    >
      <div className="shimmer-border">
        <div className="relative overflow-hidden rounded-[23px] bg-[var(--color-surface)] border border-[var(--color-border-brand)] shadow-[0_16px_60px_rgba(0,0,0,0.3)]">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-0">
            {/* Image */}
            <div className="relative h-[180px] md:h-full min-h-[240px] overflow-hidden">
              <Image src={img} alt={course.title} fill className="object-cover"
                sizes="(max-width: 768px) 100vw, 55vw" priority />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--color-surface)] hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent md:hidden" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/40" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[0.7rem] font-bold px-3 py-1.5 rounded-full bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand-glow)]">
                  <Star size={10} className="fill-current" /> BEST SELLER
                </span>
                {course.studentsEnrolled > 0 && (
                  <span className="text-[0.68rem] font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm bg-white/15 border border-white/20 text-white">
                    {course.studentsEnrolled.toLocaleString()}+ enrolled
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-dim)] border border-[var(--color-border-brand)] flex items-center justify-center">
                  <Layers size={16} className="text-[var(--color-brand)]" />
                </div>
                <p className="text-[0.66rem] font-bold uppercase tracking-widest text-[var(--color-brand-light)]">Featured Course</p>
              </div>
              <h3 className="font-display font-black text-[clamp(1.2rem,2.5vw,1.6rem)] text-[var(--color-fg)] tracking-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
                {course.title}
              </h3>
              <p className="text-[0.82rem] font-semibold text-[var(--color-brand)] mb-3">{course.subtitle}</p>
              <p className="text-[0.82rem] text-[var(--color-fg-muted)] leading-relaxed mb-4 max-w-[420px]">{course.description}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {course.highlights.map((h) => (
                  <span key={h} className="text-[0.7rem] font-medium px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-fg-muted)]">
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3.5 text-[0.74rem] text-[var(--color-fg-muted)] mb-4 flex-wrap">
                <span className="flex items-center gap-1.5"><Clock size={13} /> {course.duration}</span>
                {course.studentsEnrolled > 0 && <span className="flex items-center gap-1.5"><Users size={13} /> {course.studentsEnrolled.toLocaleString()}+</span>}
                {course.averageRating > 0 && (
                  <span className="flex items-center gap-1.5 text-[var(--color-amber)]">
                    <Star size={13} className="fill-current" /> {course.averageRating.toFixed(1)} ({course.totalReviews} reviews)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-black text-[1.4rem] text-[var(--color-fg)]" style={{ fontFamily: "var(--font-display)" }}>
                    {paise(course.price)}
                  </span>
                  {course.originalPrice && (
                    <span className="text-[0.82rem] text-[var(--color-fg-subtle)] line-through">{paise(course.originalPrice)}</span>
                  )}
                  {disc > 0 && (
                    <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-md bg-[var(--color-brand-dim)] text-[var(--color-brand)] border border-[var(--color-border-brand)]">
                      {disc}% off
                    </span>
                  )}
                </div>
                <Link href={`/courses/${course.slug}`} className="btn btn-brand py-[11px] px-6 text-[0.86rem]">
                  View Course <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section skeleton ─────────────────────────────────────────────────────────

function CoursesSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[20px] bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
          <div className="h-[140px] bg-[var(--color-surface-2)]" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-[var(--color-surface-2)] rounded w-3/4" />
            <div className="h-3 bg-[var(--color-surface-2)] rounded w-1/2" />
            <div className="h-3 bg-[var(--color-surface-2)] rounded w-full" />
            <div className="h-3 bg-[var(--color-surface-2)] rounded w-5/6" />
            <div className="h-9 bg-[var(--color-surface-2)] rounded-xl mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function Courses() {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-80px" });
  const [activeCategory, setActiveCategory] = useState("all");
  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    publicApi.getCourses()
      .then((data) => { setCourses(data); setLoading(false); })
      .catch(() => { setLoading(false); }); // silent fail — grid stays empty
  }, []);

  const featured = useMemo(
    () => courses.find((c) => c.featured) ?? courses[0] ?? null,
    [courses]
  );

  const filtered = useMemo(() => {
    const rest = featured ? courses.filter((c) => c.id !== featured.id) : courses;
    if (activeCategory === "all") return rest;
    return courses.filter((c) => c.category === activeCategory && c.id !== featured?.id);
  }, [courses, featured, activeCategory]);

  return (
    <section id="courses" className="section" ref={ref}>
      <div className="container">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }} className="text-center mb-10"
        >
          <span className="section-label justify-center">
            <span className="w-5 h-px bg-[var(--color-brand)]" />
            Our Courses
            <span className="w-5 h-px bg-[var(--color-brand)]" />
          </span>
          <h2 className="section-title">
            Find Your Perfect <span className="text-grad">Learning Path</span>
          </h2>
          <p className="section-sub mx-auto text-center mt-3">
            {loading ? "Loading courses…" : `${courses.length} structured curricula`} designed to take you from beginner to job-ready.
            Choose your track and start building your career today.
          </p>
          <a href="/courses" className="btn btn-outline mt-5 text-[0.82rem] py-[9px] px-5 mx-auto inline-flex">
            View All Courses <ArrowRight size={13} />
          </a>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          {STATIC_CATS.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.8rem] font-semibold transition-all duration-250 border",
                  isActive
                    ? "bg-[var(--color-brand-dim)] border-[var(--color-border-brand)] text-[var(--color-brand-light)] shadow-[0_0_20px_rgba(124,111,255,0.1)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-2)] hover:text-[var(--color-fg)]"
                )}>
                <CatIcon size={14} className={isActive ? "text-[var(--color-brand)]" : ""} />
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="mb-10 h-[280px] rounded-[23px] bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
            <CoursesSkeletonGrid />
          </motion.div>
        )}

        {/* Featured hero card — only in "all" view */}
        {!loading && activeCategory === "all" && featured && (
          <FeaturedCard course={featured} />
        )}

        {/* Course grid */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-12 text-center"
        >
          <div className="card inline-flex items-center gap-4 px-6 py-4">
            <p className="text-[0.88rem] text-[var(--color-fg-muted)]">
              Can&apos;t decide? Take our <span className="font-semibold text-[var(--color-fg)]">free career quiz</span> to find your perfect track.
            </p>
            <a href="#" className="btn btn-outline py-[9px] px-5 text-[0.82rem] whitespace-nowrap shrink-0">
              Take Quiz <ArrowRight size={13} />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
