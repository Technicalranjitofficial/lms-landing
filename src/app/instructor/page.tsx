"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, BookOpen, Star, TrendingUp, Edit, BarChart2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Mock data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Students",  value: "1,248", trend: "+8%",  trendUp: true,  icon: Users,      color: "cyan"  },
  { label: "Course Revenue",  value: "₹2,84,000", trend: "+22%", trendUp: true, icon: DollarSign, color: "green" },
  { label: "Published Courses", value: "7",  trend: "+1",   trendUp: true,  icon: BookOpen,   color: "brand" },
  { label: "Avg Rating",      value: "4.8",  trend: "+0.2", trendUp: true,  icon: Star,       color: "amber" },
];

const MY_COURSES = [
  {
    title: "Full Stack MERN Development",
    enrolled: 421,
    rating: 4.9,
    revenue: "₹92,400",
    thumbnail: "bg-gradient-to-br from-[#7c6fff] to-[#22d3ee]",
  },
  {
    title: "DSA with Java — Zero to Hero",
    enrolled: 538,
    rating: 4.8,
    revenue: "₹1,10,200",
    thumbnail: "bg-gradient-to-br from-[#34d399] to-[#22d3ee]",
  },
  {
    title: "React Advanced Patterns",
    enrolled: 289,
    rating: 4.7,
    revenue: "₹81,400",
    thumbnail: "bg-gradient-to-br from-[#fb7185] to-[#a78bfa]",
  },
];

const REVIEWS = [
  { student: "Arjun Patel",  rating: 5, comment: "The best DSA course I've taken. Concepts are explained very clearly with real examples.", course: "DSA with Java" },
  { student: "Sneha Reddy",  rating: 5, comment: "Instructor explains everything step by step. Projects are industry-relevant and well structured.", course: "Full Stack MERN" },
  { student: "Vikas Gupta",  rating: 4, comment: "Really good course overall. Would love to see more live coding sessions going forward.", course: "React Advanced" },
];

const colorMap: Record<string, string> = {
  cyan:  "text-[var(--color-cyan)]  bg-[var(--color-cyan-dim)]",
  green: "text-[var(--color-green)] bg-[rgba(52,211,153,0.12)]",
  brand: "text-[var(--color-brand)] bg-[var(--color-brand-dim)]",
  amber: "text-[var(--color-amber)] bg-[rgba(251,191,36,0.12)]",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0  },
};

// ─── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={cn(
            i <= rating
              ? "text-[var(--color-amber)] fill-[var(--color-amber)]"
              : "text-[var(--color-fg-subtle)]"
          )}
        />
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function InstructorOverviewPage() {
  return (
    <div className="space-y-8 max-w-[1200px]">

      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.4 }}>
        <p className="text-[var(--color-fg-muted)] text-sm">
          Your teaching summary for this month.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <p className="text-[0.8rem] font-medium text-[var(--color-fg-muted)]">{stat.label}</p>
                <span className={cn("p-2 rounded-xl", colorMap[stat.color])}>
                  <Icon size={16} />
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="font-display font-black text-2xl text-[var(--color-fg)] tracking-tight">
                  {stat.value}
                </span>
                <span className={cn(
                  "flex items-center gap-1 text-[0.72rem] font-semibold",
                  stat.trendUp ? "text-[var(--color-green)]" : "text-[var(--color-rose)]"
                )}>
                  <TrendingUp size={12} className={cn(!stat.trendUp && "rotate-180")} />
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* My Courses */}
      <motion.div
        initial="hidden" animate="show"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.32 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-[var(--color-fg)]">My Courses</h2>
          <Link
            href="/instructor/courses"
            className="text-[0.78rem] font-medium text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MY_COURSES.map((course) => (
            <div key={course.title} className="card p-4 space-y-4">
              {/* Thumbnail */}
              <div className={cn("h-28 rounded-xl", course.thumbnail)} />
              {/* Info */}
              <div className="space-y-1">
                <p className="font-semibold text-[0.88rem] text-[var(--color-fg)] leading-snug">
                  {course.title}
                </p>
                <div className="flex items-center gap-2 text-[0.76rem] text-[var(--color-fg-muted)]">
                  <Users size={12} />
                  <span>{course.enrolled.toLocaleString("en-IN")} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={course.rating} />
                  <span className="text-[0.72rem] text-[var(--color-fg-muted)]">{course.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
                <span className="text-[0.82rem] font-bold text-[var(--color-green)]">{course.revenue}</span>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost py-1.5 px-3 text-[0.76rem]">
                    <BarChart2 size={13} /> Analytics
                  </button>
                  <button className="btn btn-outline py-1.5 px-3 text-[0.76rem]">
                    <Edit size={13} /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent reviews */}
      <motion.div
        initial="hidden" animate="show"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.44 }}
        className="card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-display font-bold text-base text-[var(--color-fg)]">Recent Reviews</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {REVIEWS.map((review, i) => (
            <div key={i} className="px-5 py-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[0.84rem] text-[var(--color-fg)]">{review.student}</span>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-[0.8rem] text-[var(--color-fg-muted)] leading-relaxed line-clamp-2">
                {review.comment}
              </p>
              <span className="badge badge-violet">{review.course}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
