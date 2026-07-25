"use client";

import { useRef, useCallback, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Clock, Users, Star, ArrowRight, Code2, Globe, Layers, Brain,
  Smartphone, Server, Settings, Monitor, Sparkles, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All Courses", icon: Sparkles },
  { id: "popular", label: "Most Popular", icon: Star },
  { id: "development", label: "Development", icon: Code2 },
  { id: "data", label: "Data & AI", icon: Brain },
  { id: "devops", label: "DevOps & Cloud", icon: Server },
];

const courses = [
  {
    id: 1,
    slug: "sigma-dsa-full-stack",
    tag: "Most Popular",
    icon: Layers,
    title: "Sigma — DSA + Full Stack",
    subtitle: "Complete Placement Preparation",
    description: "The all-in-one course covering Data Structures, Algorithms, Full Stack Web Dev with MERN, and Aptitude. Industry-aligned curriculum designed by ex-FAANG engineers.",
    duration: "8.5 months",
    students: "48,000+",
    rating: "4.9",
    reviews: "12,400+",
    price: "₹14,999",
    originalPrice: "₹24,999",
    highlights: ["500+ Video Lectures", "Live Sessions", "1-on-1 Doubt Support", "Placement Prep", "Resume Building"],
    featured: true,
    category: ["all", "popular", "development"],
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-indigo-600/80 to-purple-700/90",
    accentColor: "#7c6fff",
  },
  {
    id: 2,
    slug: "alpha-plus-dsa-java-cpp",
    tag: "Beginner Friendly",
    icon: Code2,
    title: "Alpha Plus — DSA in Java/C++",
    subtitle: "Master Data Structures & Algorithms",
    description: "Start from zero and master DSA with 400+ problems. Step-by-step explanations with multiple approaches for every problem. Java and C++ tracks available.",
    duration: "4 months",
    students: "32,000+",
    rating: "4.8",
    reviews: "8,200+",
    price: "₹7,999",
    originalPrice: "₹13,999",
    highlights: ["400+ Video Lectures", "300+ Coding Problems", "Live Doubt Sessions", "Certificate", "Contest Prep"],
    featured: false,
    category: ["all", "popular", "development"],
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-cyan-600/80 to-blue-700/90",
    accentColor: "#22d3ee",
  },
  {
    id: 3,
    slug: "delta-full-stack-web-dev",
    tag: "New Batch",
    icon: Globe,
    title: "Delta — Full Stack Web Dev",
    subtitle: "MERN Stack Development",
    description: "Go from zero to full-stack developer. Build 10+ real-world apps with React, Node.js, MongoDB, and deploy to production. Includes cloud hosting.",
    duration: "5 months",
    students: "28,000+",
    rating: "4.9",
    reviews: "6,800+",
    price: "₹9,999",
    originalPrice: "₹17,999",
    highlights: ["500+ Video Lectures", "10+ Real Projects", "Resume Building", "Job Assistance", "GitHub Portfolio"],
    featured: false,
    category: ["all", "popular", "development"],
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-emerald-600/80 to-teal-700/90",
    accentColor: "#34d399",
  },
  {
    id: 4,
    slug: "ai-machine-learning",
    tag: "Coming Soon",
    icon: Brain,
    title: "AI & Machine Learning",
    subtitle: "Python + Deep Learning + NLP",
    description: "Learn Python, scikit-learn, TensorFlow, and build AI/ML projects from scratch. Includes cloud deployment and MLOps fundamentals.",
    duration: "6 months",
    students: "Early Access",
    rating: "—",
    reviews: "—",
    price: "₹11,999",
    originalPrice: "₹19,999",
    highlights: ["Python Fundamentals", "ML Algorithms", "Deep Learning & NLP", "Cloud Deployment", "Capstone Project"],
    featured: false,
    category: ["all", "data"],
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-violet-600/80 to-fuchsia-700/90",
    accentColor: "#a78bfa",
  },
  {
    id: 5,
    slug: "frontend-mastery-react-nextjs",
    tag: "Trending",
    icon: Monitor,
    title: "Frontend Mastery — React & Next.js",
    subtitle: "Modern UI Engineering",
    description: "Master React 19, Next.js 16, TypeScript, Tailwind CSS, and Framer Motion. Build production-grade apps with SSR, RSC, and performance optimization.",
    duration: "4 months",
    students: "18,000+",
    rating: "4.9",
    reviews: "4,200+",
    price: "₹8,999",
    originalPrice: "₹15,999",
    highlights: ["React 19 + Next.js 16", "TypeScript Deep Dive", "Animation & Design Systems", "Performance Optimization", "Portfolio Projects"],
    featured: false,
    category: ["all", "development"],
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-sky-600/80 to-indigo-700/90",
    accentColor: "#38bdf8",
  },
  {
    id: 6,
    slug: "backend-engineering-nodejs-go",
    tag: "Advanced",
    icon: Server,
    title: "Backend Engineering — Node.js & Go",
    subtitle: "Scalable Systems & APIs",
    description: "Build scalable backend systems with Node.js and Go. Cover microservices, databases, caching, message queues, and system design patterns.",
    duration: "5 months",
    students: "14,000+",
    rating: "4.8",
    reviews: "3,600+",
    price: "₹10,999",
    originalPrice: "₹18,999",
    highlights: ["Node.js + Express", "Go Fundamentals", "System Design", "PostgreSQL + Redis", "Docker & CI/CD"],
    featured: false,
    category: ["all", "development", "devops"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-orange-600/80 to-red-700/90",
    accentColor: "#f97316",
  },
  {
    id: 7,
    slug: "devops-cloud-aws-docker",
    tag: "New",
    icon: Settings,
    title: "DevOps & Cloud — AWS + Docker",
    subtitle: "Infrastructure & Automation",
    description: "Master Docker, Kubernetes, AWS, Terraform, and CI/CD pipelines. Learn to deploy, scale, and monitor production applications like a pro.",
    duration: "4 months",
    students: "9,500+",
    rating: "4.7",
    reviews: "2,100+",
    price: "₹9,499",
    originalPrice: "₹16,999",
    highlights: ["Docker & Kubernetes", "AWS Core Services", "Terraform IaC", "CI/CD Pipelines", "Monitoring & Logging"],
    featured: false,
    category: ["all", "devops"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-amber-600/80 to-orange-700/90",
    accentColor: "#fbbf24",
  },
  {
    id: 8,
    slug: "mobile-dev-react-native",
    tag: "Hot",
    icon: Smartphone,
    title: "Mobile Dev — React Native",
    subtitle: "Cross-Platform App Development",
    description: "Build beautiful, performant mobile apps for iOS and Android with React Native. From setup to App Store deployment with real-world projects.",
    duration: "3.5 months",
    students: "11,000+",
    rating: "4.8",
    reviews: "2,800+",
    price: "₹8,499",
    originalPrice: "₹14,999",
    highlights: ["React Native + Expo", "Native Modules", "State Management", "App Store Deployment", "Push Notifications"],
    featured: false,
    category: ["all", "development"],
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-rose-600/80 to-pink-700/90",
    accentColor: "#fb7185",
  },
  {
    id: 9,
    slug: "system-design-lld-hld",
    tag: "Advanced",
    icon: Layers,
    title: "System Design — LLD + HLD",
    subtitle: "Architect Scalable Systems",
    description: "Master low-level and high-level system design. Design Twitter, Uber, Netflix from scratch. Prepare for senior engineer and architect interviews.",
    duration: "3 months",
    students: "7,200+",
    rating: "4.9",
    reviews: "1,900+",
    price: "₹12,999",
    originalPrice: "₹21,999",
    highlights: ["Low-Level Design", "High-Level Design", "Design Patterns", "Database Sharding", "Real Interview Questions"],
    featured: false,
    category: ["all", "popular", "development"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-slate-600/80 to-zinc-700/90",
    accentColor: "#94a3b8",
  },
  {
    id: 10,
    slug: "data-science-analytics",
    tag: "New",
    icon: Brain,
    title: "Data Science & Analytics",
    subtitle: "Python + SQL + Visualization",
    description: "Become a data analyst or data scientist. Master Python, Pandas, SQL, Tableau, and statistical methods for real-world business insights.",
    duration: "5 months",
    students: "6,800+",
    rating: "4.7",
    reviews: "1,500+",
    price: "₹9,999",
    originalPrice: "₹17,999",
    highlights: ["Python + Pandas", "SQL Mastery", "Data Visualization", "Statistical Analysis", "Capstone Project"],
    featured: false,
    category: ["all", "data"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-teal-600/80 to-cyan-700/90",
    accentColor: "#2dd4bf",
  },
];

function SpotlightCard({ children, featured, index }: {
  children: React.ReactNode; featured?: boolean; index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
    cardRef.current.style.setProperty("--spotlight", "rgba(124,111,255,0.12)");
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--mx", "-999px");
    cardRef.current.style.setProperty("--my", "-999px");
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
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

function CourseCard({ course, index }: { course: typeof courses[0]; index: number }) {
  const Icon = course.icon;
  const discount = course.originalPrice && course.price
    ? Math.round((1 - parseInt(course.price.replace(/[^\d]/g, "")) / parseInt(course.originalPrice.replace(/[^\d]/g, ""))) * 100)
    : 0;

  return (
    <SpotlightCard featured={course.featured} index={index}>
      {/* Course image with gradient overlay */}
      <div className="relative h-[150px] sm:h-[140px] overflow-hidden rounded-t-[19px]">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity duration-500 group-hover:opacity-60",
          course.gradient
        )} />
        {/* Bottom fade — always dark so image looks good in both themes */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Floating tag */}
        <div className="absolute top-3 left-3">
          <span className="text-[0.63rem] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm
            bg-white/15 border border-white/20 text-white shadow-lg">
            {course.tag}
          </span>
        </div>

        {/* Featured crown badge */}
        {course.featured && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-[0.6rem] font-bold px-2 py-1 rounded-full
              bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand-glow)]">
              <Star size={9} className="fill-current" /> BEST SELLER
            </span>
          </div>
        )}

        {/* Icon floating on the image */}
        <div className="absolute bottom-3 right-4 w-10 h-10 rounded-xl backdrop-blur-md
          bg-white/10 border border-white/20 flex items-center justify-center
          shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon size={18} className="text-white" />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 pt-3 bg-[var(--color-surface)]">
        {/* Title */}
        <h3 className="font-display font-extrabold text-[0.92rem] text-[var(--color-fg)] mb-0.5 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}>
          {course.title}
        </h3>
        <p className="text-[0.68rem] font-semibold mb-2.5" style={{ color: course.accentColor }}>
          {course.subtitle}
        </p>

        {/* Description */}
        <p className="text-[0.75rem] text-[var(--color-fg-muted)] leading-relaxed mb-3 flex-1 line-clamp-2">
          {course.description}
        </p>

        {/* Highlights */}
        <ul className="flex flex-col gap-1 mb-3">
          {course.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-center gap-1.5 text-[0.7rem] text-[var(--color-fg-muted)]">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                className="flex-shrink-0" style={{ color: course.accentColor }}>
                <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeOpacity="0.3" />
                <path d="M3.5 6L5 7.5L8.5 4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {h}
            </li>
          ))}
        </ul>

        {/* Meta row */}
        <div className="flex items-center gap-2.5 text-[0.67rem] text-[var(--color-fg-subtle)] mb-3 flex-wrap">
          <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>
          <span className="flex items-center gap-1"><Users size={10} /> {course.students}</span>
          {course.rating !== "—" && (
            <span className="flex items-center gap-1 text-[var(--color-amber)]">
              <Star size={10} className="fill-current" /> {course.rating}
            </span>
          )}
        </div>

        {/* Price section */}
        <div className="pt-3 border-t border-[var(--color-border)] mt-auto">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="font-display font-extrabold text-[1.05rem] text-[var(--color-fg)]"
              style={{ fontFamily: "var(--font-display)" }}>{course.price}</span>
            <span className="text-[0.7rem] text-[var(--color-fg-subtle)] line-through">{course.originalPrice}</span>
            {discount > 0 && (
              <span className="ml-auto text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md
                bg-[var(--color-brand-dim)] text-[var(--color-brand)] border border-[var(--color-border-brand)]">
                {discount}% off
              </span>
            )}
          </div>
          <Link href={`/courses/${course.slug}`}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-[9px] rounded-xl text-[0.78rem] font-semibold transition-all duration-200",
              course.featured ? "btn btn-brand" : "btn btn-outline"
            )}>
            {course.tag === "Coming Soon" ? "Join Waitlist" : "View Course"} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}

export default function Courses() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCourses = activeCategory === "all"
    ? courses
    : courses.filter((c) => c.category.includes(activeCategory));

  return (
    <section id="courses" className="section" ref={ref}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <span className="section-label justify-center">
            <span className="w-5 h-px bg-[var(--color-brand)]" />
            Our Courses
            <span className="w-5 h-px bg-[var(--color-brand)]" />
          </span>
          <h2 className="section-title">
            Find Your Perfect{" "}
            <span className="text-grad">Learning Path</span>
          </h2>
          <p className="section-sub mx-auto text-center mt-3">
            10 structured curricula designed to take you from beginner to job-ready.
            Choose your track and start building your career today.
          </p>
          <a href="/courses" className="btn btn-outline mt-5 text-[0.82rem] py-[9px] px-5 mx-auto inline-flex">
            View All Courses <ArrowRight size={13} />
          </a>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.8rem] font-semibold transition-all duration-250 border",
                  isActive
                    ? "bg-[var(--color-brand-dim)] border-[var(--color-border-brand)] text-[var(--color-brand-light)] shadow-[0_0_20px_rgba(124,111,255,0.1)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-2)] hover:text-[var(--color-fg)]"
                )}
              >
                <CatIcon size={14} className={isActive ? "text-[var(--color-brand)]" : ""} />
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Featured course — hero card (first course when showing all) */}
        {activeCategory === "all" && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="shimmer-border">
              <div className="relative overflow-hidden rounded-[23px] bg-[var(--color-surface)] border border-[var(--color-border-brand)]
                shadow-[0_16px_60px_rgba(0,0,0,0.3)]">
                <div className="grid md:grid-cols-[1.1fr_1fr] gap-0">
                  {/* Image side */}
                  <div className="relative h-[180px] md:h-full min-h-[240px] overflow-hidden">
                    <Image
                      src={courses[0].image}
                      alt={courses[0].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 55vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--color-surface)] hidden md:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent md:hidden" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/40" />

                    {/* Floating elements on image */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[0.7rem] font-bold px-3 py-1.5 rounded-full
                        bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand-glow)]">
                        <Star size={10} className="fill-current" /> BEST SELLER
                      </span>
                      <span className="text-[0.68rem] font-bold px-2.5 py-1.5 rounded-full
                        backdrop-blur-sm bg-white/15 border border-white/20 text-white">
                        48,000+ enrolled
                      </span>
                    </div>
                  </div>

                  {/* Content side */}
                  <div className="p-5 sm:p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-brand-dim)] border border-[var(--color-border-brand)] flex items-center justify-center">
                        <Layers size={16} className="text-[var(--color-brand)]" />
                      </div>
                      <div>
                        <p className="text-[0.66rem] font-bold uppercase tracking-widest text-[var(--color-brand-light)]">Featured Course</p>
                      </div>
                    </div>

                    <h3 className="font-display font-black text-[clamp(1.2rem,2.5vw,1.6rem)] text-[var(--color-fg)] tracking-tight mb-1"
                      style={{ fontFamily: "var(--font-display)" }}>
                      {courses[0].title}
                    </h3>
                    <p className="text-[0.82rem] font-semibold text-[var(--color-brand)] mb-3">{courses[0].subtitle}</p>
                    <p className="text-[0.82rem] text-[var(--color-fg-muted)] leading-relaxed mb-4 max-w-[420px]">
                      {courses[0].description}
                    </p>

                    {/* Highlights as pills */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {courses[0].highlights.map((h) => (
                        <span key={h} className="text-[0.7rem] font-medium px-3 py-1.5 rounded-lg
                          bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-fg-muted)]">
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3.5 text-[0.74rem] text-[var(--color-fg-muted)] mb-4 flex-wrap">
                      <span className="flex items-center gap-1.5"><Clock size={13} /> {courses[0].duration}</span>
                      <span className="flex items-center gap-1.5"><Users size={13} /> {courses[0].students}</span>
                      <span className="flex items-center gap-1.5 text-[var(--color-amber)]">
                        <Star size={13} className="fill-current" /> {courses[0].rating} ({courses[0].reviews} reviews)
                      </span>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-[1.4rem] text-[var(--color-fg)]"
                          style={{ fontFamily: "var(--font-display)" }}>{courses[0].price}</span>
                        <span className="text-[0.82rem] text-[var(--color-fg-subtle)] line-through">{courses[0].originalPrice}</span>
                        <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-md bg-[var(--color-brand-dim)] text-[var(--color-brand)] border border-[var(--color-border-brand)]">
                          40% off
                        </span>
                      </div>
                      <Link href={`/courses/${courses[0].slug}`} className="btn btn-brand py-[11px] px-6 text-[0.86rem]">
                        View Course <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Course grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {(activeCategory === "all" ? filteredCourses.slice(1) : filteredCourses).map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
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
