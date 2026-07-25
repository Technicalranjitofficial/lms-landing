"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Clock, Users, Star, ArrowRight, ArrowLeft, Code2, Globe, Layers, Brain,
  Smartphone, Server, Settings, Monitor, Sparkles, Search, BookOpen,
  CheckCircle, Play, Filter, X, ChevronDown, BarChart2, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { publicApi, type Course } from "@/lib/api";
import Footer from "@/components/Footer";
import { CourseGridSkeleton } from "@/components/Skeleton";

const categories = [
  { id: "all", label: "All Courses", icon: Sparkles, count: 10 },
  { id: "popular", label: "Most Popular", icon: Star, count: 4 },
  { id: "development", label: "Development", icon: Code2, count: 7 },
  { id: "data", label: "Data & AI", icon: Brain, count: 2 },
  { id: "devops", label: "DevOps & Cloud", icon: Server, count: 2 },
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

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
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-indigo-600/80 to-purple-700/90",
    accentColor: "#7c6fff",
    modules: 24,
    projects: 12,
    instructor: "Aman Dhattarwal",
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
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-cyan-600/80 to-blue-700/90",
    accentColor: "#22d3ee",
    modules: 16,
    projects: 6,
    instructor: "Shradha Khapra",
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
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-emerald-600/80 to-teal-700/90",
    accentColor: "#34d399",
    modules: 20,
    projects: 10,
    instructor: "Shradha Khapra",
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
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-violet-600/80 to-fuchsia-700/90",
    accentColor: "#a78bfa",
    modules: 18,
    projects: 8,
    instructor: "Aman Dhattarwal",
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
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-sky-600/80 to-indigo-700/90",
    accentColor: "#38bdf8",
    modules: 14,
    projects: 7,
    instructor: "Shradha Khapra",
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
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-orange-600/80 to-red-700/90",
    accentColor: "#f97316",
    modules: 18,
    projects: 9,
    instructor: "Aman Dhattarwal",
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
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-amber-600/80 to-orange-700/90",
    accentColor: "#fbbf24",
    modules: 12,
    projects: 6,
    instructor: "Shradha Khapra",
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
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-rose-600/80 to-pink-700/90",
    accentColor: "#fb7185",
    modules: 12,
    projects: 5,
    instructor: "Aman Dhattarwal",
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
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-slate-600/80 to-zinc-700/90",
    accentColor: "#94a3b8",
    modules: 10,
    projects: 8,
    instructor: "Shradha Khapra",
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
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-teal-600/80 to-cyan-700/90",
    accentColor: "#2dd4bf",
    modules: 16,
    projects: 7,
    instructor: "Aman Dhattarwal",
  },
];

// Map category string to icon component
function getIconForCategory(category: string) {
  switch (category) {
    case "development": return Code2;
    case "data": return Brain;
    case "devops": return Server;
    case "mobile": return Smartphone;
    default: return Layers;
  }
}

function SpotlightCard({ children, index }: { children: React.ReactNode; index: number }) {
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: "easeOut" }}
      className="spotlight-card course-card flex flex-col h-full group"
    >
      {children}
    </motion.div>
  );
}

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "price-low" | "price-high" | "rating">("popular");
  const [apiCourses, setApiCourses] = useState<Course[] | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  // Fetch courses from API, fall back to static data on failure
  useEffect(() => {
    let cancelled = false;
    publicApi
      .getCourses()
      .then((data) => {
        if (!cancelled && data.length > 0) setApiCourses(data);
      })
      .catch(() => {
        // API unavailable — use static fallback silently
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Merge: use API data if available, otherwise static
  const coursesSource = useMemo(() => {
    if (apiCourses && apiCourses.length > 0) {
      // Map API courses to match the card component shape
      return apiCourses.map((c) => ({
        id: c.id as any,
        slug: c.slug,
        tag: c.tag || "",
        icon: getIconForCategory(c.category),
        title: c.title,
        subtitle: c.subtitle || "",
        description: c.description,
        duration: c.duration,
        students: c.studentsEnrolled > 0 ? `${c.studentsEnrolled.toLocaleString()}+` : "New",
        rating: c.averageRating > 0 ? c.averageRating.toFixed(1) : "—",
        reviews: c.totalReviews > 0 ? `${c.totalReviews.toLocaleString()}+` : "—",
        price: `₹${c.price.toLocaleString()}`,
        originalPrice: c.originalPrice ? `₹${c.originalPrice.toLocaleString()}` : undefined,
        highlights: c.highlights,
        featured: c.featured,
        category: ["all", c.category],
        level: c.level,
        image: c.thumbnail || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop&auto=format&q=80",
        gradient: c.gradient || "from-indigo-600/80 to-purple-700/90",
        accentColor: c.accentColor || "#7c6fff",
        modules: c.totalModules,
        projects: c.totalProjects,
        instructor: c.instructor,
      })) as typeof courses;
    }
    return courses; // static fallback
  }, [apiCourses]);

  const filteredCourses = useMemo(() => {
    let result = coursesSource;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((c) => c.category.includes(activeCategory));
    }

    // Level filter
    if (activeLevel !== "All Levels") {
      result = result.filter((c) => c.level === activeLevel);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result = [...result].sort(
          (a, b) => parseInt(a.price.replace(/[^\d]/g, "")) - parseInt(b.price.replace(/[^\d]/g, ""))
        );
        break;
      case "price-high":
        result = [...result].sort(
          (a, b) => parseInt(b.price.replace(/[^\d]/g, "")) - parseInt(a.price.replace(/[^\d]/g, ""))
        );
        break;
      case "rating":
        result = [...result].sort((a, b) => {
          const ra = a.rating === "—" ? 0 : parseFloat(a.rating);
          const rb = b.rating === "—" ? 0 : parseFloat(b.rating);
          return rb - ra;
        });
        break;
      default:
        // popular — featured first, then by students count
        result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [activeCategory, activeLevel, searchQuery, sortBy, coursesSource]);

  return (
    <div className="page-wrap mesh-bg noise-overlay min-h-screen">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 py-4 backdrop-blur-xl border-b border-[var(--color-border)] bg-[var(--color-bg)]/85">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="CodePath Home">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center shadow-lg shadow-[var(--color-brand-glow)] group-hover:scale-105 transition-transform duration-200">
                <BookOpen size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-extrabold text-[1.15rem] tracking-[-0.03em] text-[var(--color-fg)]"
                style={{ fontFamily: "var(--font-display)" }}>
                <span className="text-grad">CGS</span>
              </span>
            </Link>
            <span className="hidden sm:block w-px h-6 bg-[var(--color-border)]" />
            <span className="hidden sm:block text-[0.84rem] font-semibold text-[var(--color-fg-muted)]">All Courses</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="btn btn-ghost text-[0.82rem] py-2 px-3 sm:px-4 gap-1.5">
              <ArrowLeft size={14} /> <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <Link href="/#courses" className="btn btn-brand text-[0.82rem] py-[9px] px-5 hidden sm:inline-flex">
              Start Learning
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="pt-16 pb-10 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,111,255,0.08), transparent 60%)" }} />

        <div className="container relative z-10" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center max-w-[700px] mx-auto"
          >
            <span className="section-label justify-center">
              <span className="w-5 h-px bg-[var(--color-brand)]" />
              Explore All Courses
              <span className="w-5 h-px bg-[var(--color-brand)]" />
            </span>
            <h1 className="font-display font-black text-[clamp(2.4rem,5vw,3.6rem)] text-[var(--color-fg)] tracking-[-0.04em] leading-[1.05] mb-4"
              style={{ fontFamily: "var(--font-display)" }}>
              Level Up Your{" "}
              <span className="text-grad">Tech Career</span>
            </h1>
            <p className="text-[clamp(0.88rem,1.4vw,1rem)] text-[var(--color-fg-muted)] leading-relaxed mb-6">
              10 industry-leading courses. 1,20,000+ students. From absolute beginner to placement-ready in months.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              {[
                { icon: Users, value: "1,20,000+", label: "Students", color: "#22d3ee" },
                { icon: BarChart2, value: "4.9/5", label: "Avg Rating", color: "#fbbf24" },
                { icon: BookOpen, value: "10", label: "Courses", color: "#7c6fff" },
                { icon: Zap, value: "95%", label: "Placed", color: "#34d399" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={16} style={{ color }} />
                  <span className="font-display font-bold text-[var(--color-fg)] text-[0.92rem]"
                    style={{ fontFamily: "var(--font-display)" }}>{value}</span>
                  <span className="text-[0.78rem] text-[var(--color-fg-muted)]">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="max-w-[560px] mx-auto"
          >
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
              <input
                type="text"
                placeholder="Search courses — DSA, React, Python, DevOps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-11 pr-10 py-[14px] text-[0.9rem] rounded-2xl
                  bg-[var(--color-surface)] border-[var(--color-border-2)]
                  shadow-[0_4px_24px_rgba(0,0,0,0.2)]
                  focus:shadow-[0_4px_32px_rgba(124,111,255,0.15)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
                    bg-[var(--color-surface-3)] flex items-center justify-center
                    text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
                >
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[0.78rem] font-semibold transition-all duration-250 border",
                      isActive
                        ? "bg-[var(--color-brand-dim)] border-[var(--color-border-brand)] text-[var(--color-brand-light)] shadow-[0_0_16px_rgba(124,111,255,0.08)]"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-2)] hover:text-[var(--color-fg)]"
                    )}
                  >
                    <CatIcon size={13} />
                    {cat.label}
                    <span className={cn(
                      "text-[0.65rem] px-1.5 py-0.5 rounded-md",
                      isActive ? "bg-[var(--color-brand)]/20 text-[var(--color-brand-light)]" : "bg-[var(--color-surface-3)] text-[var(--color-fg-subtle)]"
                    )}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Level + Sort */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Level pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0">
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveLevel(lvl)}
                    className={cn(
                      "px-2.5 sm:px-3 py-1.5 rounded-lg text-[0.7rem] sm:text-[0.72rem] font-semibold transition-all duration-200 whitespace-nowrap",
                      activeLevel === lvl
                        ? "bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]"
                        : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="input py-2 px-3 text-[0.78rem] rounded-xl w-auto min-w-[140px] cursor-pointer
                  bg-[var(--color-surface)] border-[var(--color-border)]"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 mb-6">
            <p className="text-[0.82rem] text-[var(--color-fg-muted)]">
              Showing <span className="font-semibold text-[var(--color-fg)]">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? "s" : ""}
              {searchQuery && (
                <span> for &ldquo;<span className="text-[var(--color-brand-light)]">{searchQuery}</span>&rdquo;</span>
              )}
            </p>
            {(searchQuery || activeCategory !== "all" || activeLevel !== "All Levels") && (
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); setActiveLevel("All Levels"); }}
                className="text-[0.75rem] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Course grid — skeleton while API call is in-flight */}
          {apiLoading ? (
            <CourseGridSkeleton count={6} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${activeLevel}-${sortBy}-${searchQuery}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredCourses.map((course, i) => (
                  <CoursePageCard key={course.id} course={course} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty state */}
          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                <Search size={24} className="text-[var(--color-fg-subtle)]" />
              </div>
              <p className="text-[1.05rem] font-semibold text-[var(--color-fg)] mb-2">No courses found</p>
              <p className="text-[0.88rem] text-[var(--color-fg-muted)] max-w-[360px]">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); setActiveLevel("All Levels"); }}
                className="btn btn-outline mt-5 text-[0.84rem] py-[10px] px-5"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-20">
        <div className="container">
          <div className="shimmer-border">
            <div className="relative overflow-hidden rounded-[18px] bg-[var(--color-surface)] border border-[var(--color-border-brand)] px-6 py-5 sm:px-8 sm:py-6">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 60% 60% at 30% 50%, rgba(124,111,255,0.06), transparent 65%)" }} />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-[1rem] sm:text-[1.15rem] text-[var(--color-fg)] mb-1"
                    style={{ fontFamily: "var(--font-display)" }}>
                    Not sure which course is right for you?
                  </h3>
                  <p className="text-[0.78rem] text-[var(--color-fg-muted)] max-w-[420px]">
                    Book a free 1-on-1 counseling call. We&apos;ll help you pick the perfect track for your goals.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <a href="/#courses" className="btn btn-brand py-2 px-5 text-[0.8rem]">
                    Book Free Call <ArrowRight size={13} />
                  </a>
                  <a href="/" className="btn btn-outline py-2 px-4 text-[0.8rem]">
                    Take Career Quiz
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function CoursePageCard({ course, index }: { course: typeof courses[0]; index: number }) {
  const Icon = course.icon;
  const discount = course.originalPrice && course.price
    ? Math.round((1 - parseInt(course.price.replace(/[^\d]/g, "")) / parseInt(course.originalPrice.replace(/[^\d]/g, ""))) * 100)
    : 0;

  return (
    <SpotlightCard index={index}>
      {/* Image section */}
      <div className="relative h-[155px] overflow-hidden rounded-t-[19px]">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-65 transition-opacity duration-500 group-hover:opacity-50",
          course.gradient
        )} />
        {/* Bottom fade — always dark to look good in both light and dark mode */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm
            bg-black/30 border border-white/20 text-white shadow-lg">
            {course.tag}
          </span>
          {course.featured && (
            <span className="flex items-center gap-1 text-[0.6rem] font-bold px-2 py-1 rounded-full
              bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand-glow)]">
              <Star size={9} className="fill-current" /> BEST SELLER
            </span>
          )}
        </div>

        {/* Level badge */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            "text-[0.62rem] font-bold px-2 py-1 rounded-full backdrop-blur-sm border border-white/15",
            course.level === "Beginner" && "bg-emerald-500/20 text-emerald-200",
            course.level === "Intermediate" && "bg-amber-500/20 text-amber-200",
            course.level === "Advanced" && "bg-rose-500/20 text-rose-200"
          )}>
            {course.level}
          </span>
        </div>

        {/* Icon */}
        <div className="absolute bottom-3 right-4 w-10 h-10 rounded-xl backdrop-blur-md
          bg-white/10 border border-white/20 flex items-center justify-center
          shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon size={18} className="text-white" />
        </div>

        {/* Play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
            <Play size={18} className="text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 pt-3 bg-[var(--color-surface)]">
        <h3 className="font-display font-extrabold text-[0.92rem] text-[var(--color-fg)] mb-0.5 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}>
          {course.title}
        </h3>
        <p className="text-[0.68rem] font-semibold mb-2" style={{ color: course.accentColor }}>
          {course.subtitle}
        </p>

        {/* Instructor */}
        <p className="text-[0.66rem] text-[var(--color-fg-subtle)] mb-2.5 flex items-center gap-1">
          <Users size={8} className="text-[var(--color-fg-muted)]" />
          by {course.instructor}
        </p>

        {/* Description */}
        <p className="text-[0.76rem] text-[var(--color-fg-muted)] leading-relaxed mb-3 flex-1 line-clamp-2">
          {course.description}
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="flex flex-col items-center p-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <span className="text-[0.72rem] font-bold text-[var(--color-fg)]">{course.modules}</span>
            <span className="text-[0.57rem] text-[var(--color-fg-subtle)]">Modules</span>
          </div>
          <div className="flex flex-col items-center p-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <span className="text-[0.72rem] font-bold text-[var(--color-fg)]">{course.projects}</span>
            <span className="text-[0.57rem] text-[var(--color-fg-subtle)]">Projects</span>
          </div>
          <div className="flex flex-col items-center p-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <span className="text-[0.72rem] font-bold text-[var(--color-fg)]">{course.duration}</span>
            <span className="text-[0.57rem] text-[var(--color-fg-subtle)]">Duration</span>
          </div>
        </div>

        {/* Highlights */}
        <ul className="flex flex-col gap-1 mb-3">
          {course.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-center gap-1.5 text-[0.7rem] text-[var(--color-fg-muted)]">
              <CheckCircle size={11} className="flex-shrink-0" style={{ color: course.accentColor }} />
              {h}
            </li>
          ))}
        </ul>

        {/* Meta row */}
        <div className="flex items-center gap-2.5 text-[0.67rem] text-[var(--color-fg-subtle)] mb-3 flex-wrap">
          <span className="flex items-center gap-1"><Users size={10} /> {course.students}</span>
          {course.rating !== "—" && (
            <span className="flex items-center gap-1 text-[var(--color-amber)]">
              <Star size={10} className="fill-current" /> {course.rating}
              <span className="text-[var(--color-fg-subtle)]">({course.reviews})</span>
            </span>
          )}
        </div>

        {/* Price + CTA */}
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
          <div className="flex gap-1.5">
            <Link href={`/courses/${course.slug}`}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[0.76rem] font-semibold transition-all duration-200",
                course.featured ? "btn btn-brand" : "btn btn-outline"
              )}>
              {course.tag === "Coming Soon" ? "Join Waitlist" : "View Course"} <ArrowRight size={12} />
            </Link>
            <button className="w-[36px] h-[36px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]
              flex items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-brand)]
              hover:border-[var(--color-border-brand)] transition-all duration-200" aria-label="Preview course">
              <Play size={13} />
            </button>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
