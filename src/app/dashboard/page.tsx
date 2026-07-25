"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, Award, Flame, PlayCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/AuthProvider";

// ─── Mock data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Courses Enrolled",    value: "4",   icon: BookOpen,    color: "brand" },
  { label: "Lessons Completed",   value: "68",  icon: CheckCircle, color: "green" },
  { label: "Hours Watched",       value: "42h", icon: Clock,       color: "cyan"  },
  { label: "Certificates Earned", value: "1",   icon: Award,       color: "amber" },
];

const CONTINUE_COURSE = {
  title: "Full Stack MERN Development",
  progress: 62,
  lastLesson: "Building REST APIs with Express.js",
  thumbnail: "bg-gradient-to-br from-[#7c6fff] to-[#22d3ee]",
  href: "/dashboard/courses",
};

const ENROLLED_COURSES = [
  {
    title: "Full Stack MERN Development",
    progress: 62,
    lastAccessed: "2 hours ago",
    thumbnail: "bg-gradient-to-br from-[#7c6fff] to-[#22d3ee]",
  },
  {
    title: "DSA with Java — Zero to Hero",
    progress: 34,
    lastAccessed: "Yesterday",
    thumbnail: "bg-gradient-to-br from-[#34d399] to-[#22d3ee]",
  },
  {
    title: "React Advanced Patterns",
    progress: 88,
    lastAccessed: "3 days ago",
    thumbnail: "bg-gradient-to-br from-[#fb7185] to-[#a78bfa]",
  },
];

const colorMap: Record<string, string> = {
  brand: "text-[var(--color-brand)] bg-[var(--color-brand-dim)]",
  green: "text-[var(--color-green)] bg-[rgba(52,211,153,0.12)]",
  cyan:  "text-[var(--color-cyan)]  bg-[var(--color-cyan-dim)]",
  amber: "text-[var(--color-amber)] bg-[rgba(251,191,36,0.12)]",
};

const STREAK = 7; // days

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0  },
};

export default function StudentDashboardPage() {
  const { user } = useAuthContext();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 max-w-[1100px]">

      {/* Welcome banner */}
      <motion.div
        initial="hidden" animate="show"
        variants={fadeUp}
        transition={{ duration: 0.45 }}
        className="card p-6 flex items-center justify-between gap-4 overflow-hidden relative"
      >
        {/* Ambient glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[var(--color-brand-dim)] blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <h2 className="font-display font-black text-xl text-[var(--color-fg)]">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-[0.84rem] text-[var(--color-fg-muted)]">
            Keep the momentum going — you're doing great!
          </p>
        </div>

        {/* Streak counter */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2 bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.2)] rounded-2xl px-4 py-2.5">
            <Flame size={20} className="text-[var(--color-amber)]" />
            <div className="text-center">
              <p className="font-display font-black text-lg text-[var(--color-amber)] leading-none">{STREAK}</p>
              <p className="text-[0.6rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide">day streak</p>
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
                <p className="font-display font-black text-xl text-[var(--color-fg)] leading-none">{stat.value}</p>
                <p className="text-[0.72rem] text-[var(--color-fg-muted)] mt-0.5 leading-snug">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Continue learning */}
      <motion.div
        initial="hidden" animate="show"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="space-y-3"
      >
        <h2 className="font-display font-bold text-lg text-[var(--color-fg)]">Continue Learning</h2>
        <div className="card p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {/* Thumbnail */}
          <div className={cn("w-full sm:w-32 h-20 rounded-xl shrink-0", CONTINUE_COURSE.thumbnail)} />

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="font-semibold text-[0.92rem] text-[var(--color-fg)]">{CONTINUE_COURSE.title}</p>
            <p className="text-[0.78rem] text-[var(--color-fg-muted)] truncate">
              Up next: {CONTINUE_COURSE.lastLesson}
            </p>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${CONTINUE_COURSE.progress}%` }}
                />
              </div>
              <p className="text-[0.7rem] text-[var(--color-fg-muted)]">{CONTINUE_COURSE.progress}% complete</p>
            </div>
          </div>

          {/* CTA */}
          <Link href={CONTINUE_COURSE.href} className="btn btn-brand shrink-0">
            <PlayCircle size={16} /> Resume
          </Link>
        </div>
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
            className="text-[0.78rem] font-medium text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENROLLED_COURSES.map((course) => (
            <div key={course.title} className="card overflow-hidden">
              {/* Thumbnail */}
              <div className={cn("h-28", course.thumbnail)} />
              {/* Content */}
              <div className="p-4 space-y-3">
                <p className="font-semibold text-[0.86rem] text-[var(--color-fg)] leading-snug line-clamp-2">
                  {course.title}
                </p>
                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[0.7rem] text-[var(--color-fg-muted)]">
                    <span>{course.progress}% complete</span>
                    <span>{course.lastAccessed}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
