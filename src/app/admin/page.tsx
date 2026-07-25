"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, TrendingUp, MessageSquare,
  PlusCircle, Tag, ArrowUpRight, RefreshCcw,
  ShoppingBag, Star, Zap, Activity,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { adminApi, formatPrice, formatDate, type AdminStats } from "@/lib/adminApi";

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0  },
};
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

// ─── Stat card config ──────────────────────────────────────────────────────────
interface StatConfig {
  key:     keyof Pick<AdminStats, "students" | "courses" | "enrollments" | "openTickets">;
  label:   string;
  sub:     string;
  icon:    React.ElementType;
  gradient: string;
  glow:    string;
  badge:   string;
  href:    string;
}

const STATS: StatConfig[] = [
  {
    key:      "students",
    label:    "Total Students",
    sub:      "Active learners",
    icon:     Users,
    gradient: "from-[var(--color-cyan)] to-[var(--color-brand)]",
    glow:     "shadow-[var(--color-cyan)]/20",
    badge:    "bg-[var(--color-cyan-dim)] text-[var(--color-cyan)]",
    href:     "/admin/users",
  },
  {
    key:      "courses",
    label:    "Published Courses",
    sub:      "Live in catalog",
    icon:     BookOpen,
    gradient: "from-[var(--color-brand)] to-[var(--color-violet)]",
    glow:     "shadow-[var(--color-brand)]/20",
    badge:    "bg-[var(--color-brand-dim)] text-[var(--color-brand-light)]",
    href:     "/admin/courses",
  },
  {
    key:      "enrollments",
    label:    "Enrollments",
    sub:      "All time",
    icon:     TrendingUp,
    gradient: "from-[var(--color-green)] to-[var(--color-cyan)]",
    glow:     "shadow-[var(--color-green)]/20",
    badge:    "bg-[rgba(52,211,153,0.12)] text-[var(--color-green)]",
    href:     "/admin/orders",
  },
  {
    key:      "openTickets",
    label:    "Open Tickets",
    sub:      "Needs attention",
    icon:     MessageSquare,
    gradient: "from-[var(--color-amber)] to-[var(--color-rose)]",
    glow:     "shadow-[var(--color-amber)]/20",
    badge:    "bg-[rgba(251,191,36,0.12)] text-[var(--color-amber)]",
    href:     "/admin/support",
  },
];

// ─── Skeleton stat card ────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-2.5 rounded-full bg-[var(--color-surface-3)] w-20" />
          <div className="h-7 rounded-lg bg-[var(--color-surface-3)] w-16" />
          <div className="h-2 rounded-full bg-[var(--color-surface-3)] w-24" />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-3)]" />
      </div>
    </div>
  );
}

// ─── Premium stat card ─────────────────────────────────────────────────────────
function StatCard({
  config,
  value,
  index,
}: {
  config: StatConfig;
  value:  number;
  index:  number;
}) {
  const Icon = config.icon;
  return (
    <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: index * 0.06 }}>
      <Link href={config.href} className="group block">
        <div className={cn(
          "relative overflow-hidden rounded-2xl border border-[var(--color-border-2)]",
          "bg-[var(--color-surface)] p-5",
          "transition-all duration-300",
          "hover:border-[var(--color-border-brand)] hover:-translate-y-1",
          `hover:shadow-xl ${config.glow}`,
        )}>
          {/* Background gradient blob */}
          <div className={cn(
            "absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl",
            "bg-gradient-to-br", config.gradient
          )} />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[0.74rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide">
                {config.label}
              </p>
              <p className={cn(
                "font-display font-black text-[1.9rem] tracking-tight leading-none mt-2",
                "text-[var(--color-fg)]"
              )}>
                {value.toLocaleString("en-IN")}
              </p>
              <p className="text-[0.72rem] text-[var(--color-fg-subtle)] mt-1.5 flex items-center gap-1">
                <Activity size={10} />
                {config.sub}
              </p>
            </div>

            {/* Icon box */}
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
              "bg-gradient-to-br shadow-lg", config.gradient,
            )}>
              <Icon size={20} className="text-white" />
            </div>
          </div>

          {/* Arrow on hover */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={14} className="text-[var(--color-fg-muted)]" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Quick action button ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "New Course",    href: "/admin/courses/new", icon: PlusCircle,  variant: "brand"   },
  { label: "Add Coupon",    href: "/admin/coupons",     icon: Tag,         variant: "outline" },
  { label: "All Orders",    href: "/admin/orders",      icon: ShoppingBag, variant: "outline" },
  { label: "Students",      href: "/admin/users",       icon: Users,       variant: "outline" },
];

// ─── Mini sparkline bars (decorative) ─────────────────────────────────────────
function SparkBars({ color }: { color: string }) {
  const heights = [30, 55, 40, 70, 50, 90, 65, 80, 60, 95];
  return (
    <div className="flex items-end gap-[3px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className={cn("w-[3px] rounded-full opacity-70", color)}
        />
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.get<AdminStats>("stats");
      setStats(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-7 max-w-[1240px]">

      {/* ── Hero header row ── */}
      <motion.div
        initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-cyan)] flex items-center justify-center">
              <Zap size={11} className="text-white" fill="white" />
            </div>
            <span className="text-[0.72rem] font-bold uppercase tracking-widest text-[var(--color-brand-light)]">
              Admin Overview
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-[var(--color-fg)] tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-0.5">
            Here&apos;s what&apos;s happening on your platform today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="btn btn-ghost text-xs py-2 px-3 gap-1.5"
          >
            <RefreshCcw size={13} className={cn(loading && "animate-spin")} />
            Refresh
          </button>
          <Link href="/admin/courses/new" className="btn btn-brand text-sm py-2.5">
            <PlusCircle size={14} />
            New Course
          </Link>
        </div>
      </motion.div>

      {/* ── Error ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/8 px-5 py-3 text-[var(--color-rose)] text-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-rose)] shrink-0" />
          {error} —
          <button onClick={load} className="underline underline-offset-2 hover:no-underline transition-all">
            retry
          </button>
        </motion.div>
      )}

      {/* ── Stat cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        initial="hidden" animate="show" variants={stagger}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : STATS.map((cfg, i) => (
              <StatCard
                key={cfg.key}
                config={cfg}
                value={stats?.[cfg.key] ?? 0}
                index={i}
              />
            ))}
      </motion.div>

      {/* ── Middle row: quick actions + mini stats ── */}
      <motion.div
        initial="hidden" animate="show" variants={stagger}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Quick actions card */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="lg:col-span-2">
          <div className="card p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-[var(--color-brand-dim)] flex items-center justify-center">
                <Zap size={12} className="text-[var(--color-brand-light)]" />
              </div>
              <h2 className="font-display font-bold text-sm text-[var(--color-fg)]">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={cn(
                      "group flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-200 text-center",
                      action.variant === "brand"
                        ? "bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] border-[var(--color-brand)] text-white hover:shadow-lg hover:shadow-[var(--color-brand-glow)] hover:-translate-y-0.5"
                        : "border-[var(--color-border-2)] bg-[var(--color-surface-2)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-brand)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-3)] hover:-translate-y-0.5"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      action.variant === "brand"
                        ? "bg-white/20"
                        : "bg-[var(--color-surface-3)]"
                    )}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[0.74rem] font-semibold leading-tight">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Platform health mini card */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <div className="card p-5 h-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[rgba(52,211,153,0.12)] flex items-center justify-center">
                  <Activity size={12} className="text-[var(--color-green)]" />
                </div>
                <h2 className="font-display font-bold text-sm text-[var(--color-fg)]">Platform Health</h2>
              </div>
              <span className="badge badge-green text-[0.65rem]">Live</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Enrollment rate", pct: 78, color: "bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-cyan)]" },
                { label: "Ticket resolution", pct: 91, color: "bg-gradient-to-r from-[var(--color-green)] to-[var(--color-cyan)]" },
                { label: "Course completion", pct: 64, color: "bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-brand)]" },
              ].map((s) => (
                <div key={s.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.74rem] text-[var(--color-fg-muted)]">{s.label}</span>
                    <span className="text-[0.74rem] font-bold text-[var(--color-fg)]">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
                      className={cn("h-full rounded-full", s.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Sparklines */}
            <div className="flex items-end justify-between pt-1 border-t border-[var(--color-border)]">
              <span className="text-[0.7rem] text-[var(--color-fg-subtle)]">Enrollments this week</span>
              <SparkBars color="bg-[var(--color-brand)]" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Recent enrollments table ── */}
      <motion.div
        initial="hidden" animate="show" variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <div className="card overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[var(--color-brand-dim)] flex items-center justify-center">
                <TrendingUp size={14} className="text-[var(--color-brand-light)]" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm text-[var(--color-fg)]">
                  Recent Enrollments
                </h2>
                <p className="text-[0.68rem] text-[var(--color-fg-subtle)]">Latest student activity</p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors group"
            >
              View all
              <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="bg-[var(--color-surface-2)]">
                  {["Student", "Course", "Amount", "Date", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[0.72rem] font-bold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3.5 rounded-full bg-[var(--color-surface-2)] animate-pulse" style={{ width: `${60 + (j * 8) % 30}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !stats || stats.recentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center">
                          <ShoppingBag size={18} className="text-[var(--color-fg-subtle)]" />
                        </div>
                        <p className="text-sm text-[var(--color-fg-muted)]">No enrollments yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stats.recentEnrollments.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="hover:bg-[var(--color-surface-2)] transition-colors group"
                    >
                      {/* Student */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-cyan)] flex items-center justify-center shrink-0">
                            <span className="text-[0.62rem] font-black text-white">
                              {row.user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--color-fg)]">{row.user.name}</p>
                            <p className="text-[0.72rem] text-[var(--color-fg-muted)]">{row.user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Course */}
                      <td className="px-6 py-4 text-[var(--color-fg-muted)] max-w-[180px]">
                        <span className="truncate block">{row.course.title}</span>
                      </td>
                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-[var(--color-fg)]">
                          {row.order ? formatPrice(row.order.finalAmount) : <span className="badge badge-green">Free</span>}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 text-[var(--color-fg-muted)]">
                        {formatDate(row.enrolledAt)}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={cn(
                          "badge",
                          row.order?.status === "PAID"    ? "badge-green"  :
                          row.order?.status === "PENDING" ? "badge-amber"  :
                          !row.order                      ? "badge-cyan"   : "badge-rose"
                        )}>
                          {row.order?.status === "PAID" ? "Paid" : row.order?.status ?? "Free"}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom summary strip ── */}
      {(stats || loading) && (
        <motion.div
          initial="hidden" animate="show" variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Reviews",     val: stats?.reviews     ?? 0, icon: Star,          gradient: "from-[var(--color-amber)] to-[var(--color-rose)]"   },
            { label: "Enrollments", val: stats?.enrollments ?? 0, icon: TrendingUp,    gradient: "from-[var(--color-green)] to-[var(--color-cyan)]"    },
            { label: "Courses",     val: stats?.courses     ?? 0, icon: BookOpen,      gradient: "from-[var(--color-brand)] to-[var(--color-violet)]"  },
            { label: "Students",    val: stats?.students    ?? 0, icon: Users,         gradient: "from-[var(--color-cyan)] to-[var(--color-brand)]"    },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="card p-4 flex items-center gap-3 hover:border-[var(--color-border-brand)] transition-colors"
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  "bg-gradient-to-br shadow-sm", s.gradient
                )}>
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  {loading
                    ? <div className="h-5 w-12 rounded-md bg-[var(--color-surface-3)] animate-pulse" />
                    : <p className="font-display font-black text-lg text-[var(--color-fg)] leading-tight">
                        {s.val.toLocaleString("en-IN")}
                      </p>
                  }
                  <p className="text-[0.7rem] text-[var(--color-fg-muted)]">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

    </div>
  );
}
