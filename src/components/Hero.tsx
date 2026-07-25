"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Play, Users, BookOpen, Trophy, CheckCircle, BarChart2 } from "lucide-react";

const techStack = ["JavaScript", "React", "Node.js", "Python", "Java", "DSA", "System Design", "SQL"];

// Context-driven colors: students=cyan (learning community), rating=amber (quality), lectures=purple (brand), placed=orange (achievement)
const trustBadges = [
  { icon: Users,    value: "1,20,000+", label: "Happy Students", color: "#22d3ee", dimColor: "rgba(34,211,238,0.1)",  borderColor: "rgba(34,211,238,0.25)" },
  { icon: BarChart2,value: "4.9/5",     label: "Average Rating", color: "#fbbf24", dimColor: "rgba(251,191,36,0.1)",  borderColor: "rgba(251,191,36,0.25)"  },
  { icon: BookOpen, value: "150+",      label: "Video Lectures",  color: "#7c6fff", dimColor: "rgba(124,111,255,0.12)", borderColor: "rgba(124,111,255,0.3)"  },
  { icon: Trophy,   value: "2,400+",    label: "Jobs Placed",    color: "#f97316", dimColor: "rgba(249,115,22,0.1)",  borderColor: "rgba(249,115,22,0.25)"  },
];

const proofPoints = ["No prior experience needed", "2-year course access", "Live doubt support"];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY  = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const txtY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section ref={ref} id="hero" className="relative min-h-[100svh] lg:min-h-[90svh] flex flex-col justify-center overflow-hidden pt-[100px] sm:pt-[90px] pb-[32px] sm:pb-[48px]">

      {/* Brand glow top, subtle */}
      <div className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(124,111,255,0.1), transparent 60%)" }} />

      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 500px 400px at -5% 10%, rgba(124,111,255,0.12), transparent 65%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 400px 350px at 105% 90%, rgba(34,211,238,0.06), transparent 65%)" }} />
      </motion.div>

      {/* Aurora */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] pointer-events-none z-[1]">
        <motion.div className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,111,255,0.25), transparent 65%)", filter: "blur(100px)" }}
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.92, 1.06, 0.92] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        backgroundImage: "radial-gradient(rgba(124,111,255,0.1) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 10%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 10%, transparent 100%)",
      }} />

      <motion.div style={{ y: txtY }} className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-[860px] mx-auto">

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 32, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.65, delay: 0.05, ease: "easeOut" }}
            className="font-display font-black leading-[0.97] tracking-[-0.05em] mb-4 sm:mb-6"
            style={{ fontSize: "clamp(2rem,5.5vw,4.5rem)", fontFamily: "var(--font-display)" }}>
            Learn to Code.
            <br />
            <span className="text-shimmer">Get Hired.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
            className="text-[clamp(0.9rem,1.6vw,1.05rem)] text-[var(--color-fg-muted)] max-w-[500px] leading-relaxed mb-4 mx-auto">
            Master DSA, Full Stack Development, and placement prep through live classes,
            150+ recorded lectures, and 1-on-1 mentor support.
          </motion.p>

          {/* Proof points — green checkmarks (completion/verified) */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6 sm:mb-8">
            {proofPoints.map(p => (
              <span key={p} className="inline-flex items-center gap-1.5 text-[0.78rem] text-[var(--color-fg-muted)]">
                <CheckCircle size={13} style={{ color: "#34d399" }} strokeWidth={2.5} className="flex-shrink-0" />
                {p}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-3 mb-8 sm:mb-10">
            <a href="#courses" className="btn btn-brand text-[0.84rem] sm:text-[0.92rem] py-[11px] sm:py-[13px] px-6 sm:px-8 gap-2">
              Explore Courses <ArrowRight size={16} />
            </a>
            <button className="btn btn-outline text-[0.84rem] sm:text-[0.92rem] py-[11px] sm:py-[13px] px-5 sm:px-7 gap-2.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#22d3ee" }}>
                <Play size={10} className="fill-white text-white ml-0.5" />
              </span>
              Watch Preview
            </button>
          </motion.div>

          {/* Trust badges — each color signals meaning */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.36, ease: "easeOut" }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-[680px] mb-8 lg:mb-10">
            {trustBadges.map(({ icon: Icon, value, label, color, dimColor, borderColor }) => (
              <div key={label}
                className="card flex flex-col items-center py-3.5 sm:py-4 px-3 gap-1 cursor-default
                  hover:-translate-y-1 transition-transform duration-200"
                style={{ borderColor }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-0.5"
                  style={{ background: dimColor, border: `1px solid ${borderColor}` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <span className="font-display font-extrabold text-[1.05rem] sm:text-[1.15rem] tracking-tight text-[var(--color-fg)]"
                  style={{ fontFamily: "var(--font-display)" }}>{value}</span>
                <span className="text-[0.64rem] text-[var(--color-fg-muted)] font-medium text-center leading-tight">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Tech stack */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-3">
            <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[var(--color-fg-subtle)]">
              Technologies You&apos;ll Master
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {techStack.map((tech) => (
                <span key={tech}
                  className="py-1.5 px-4 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]
                    text-[0.78rem] font-medium text-[var(--color-fg-muted)] cursor-default
                    hover:border-[rgba(34,211,238,0.4)] hover:text-[var(--color-fg)] transition-all duration-200">
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stylish floating images showcase */}
        <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.72, ease: "easeOut" }}
          className="mt-10 max-w-[900px] mx-auto hidden sm:block">
          <div className="relative h-[240px] lg:h-[280px]">
            {/* Main center image — large, tilted */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] lg:w-[400px] h-[220px] lg:h-[240px] rounded-[18px] overflow-hidden border-2 border-[var(--color-border)] shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop&auto=format&q=80"
                alt="Students collaborating on code" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.4)] to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-[0.82rem] font-semibold">Live Collaborative Coding</p>
                <p className="text-white/60 text-[0.7rem]">Students working together on real projects</p>
              </div>
            </motion.div>

            {/* Left floating image — smaller, rotated */}
            <motion.div
              className="absolute left-[2%] top-[10%] w-[160px] h-[110px] rounded-[14px] overflow-hidden border border-[var(--color-border)] shadow-[0_16px_48px_rgba(0,0,0,0.4)] -rotate-6"
              animate={{ y: [0, -12, 0], rotate: [-6, -4, -6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
              <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=280&fit=crop&auto=format&q=80"
                alt="Code on screen" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,111,255,0.2)] to-transparent" />
            </motion.div>

            {/* Right floating image — smaller, rotated other way */}
            <motion.div
              className="absolute right-[2%] top-[5%] w-[155px] h-[105px] rounded-[14px] overflow-hidden border border-[var(--color-border)] shadow-[0_16px_48px_rgba(0,0,0,0.4)] rotate-4"
              animate={{ y: [0, -10, 0], rotate: [4, 6, 4] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
              <img src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=280&fit=crop&auto=format&q=80"
                alt="Programming setup" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-bl from-[rgba(34,211,238,0.15)] to-transparent" />
            </motion.div>

            {/* Bottom-left accent image */}
            <motion.div
              className="absolute left-[12%] bottom-[3%] w-[130px] h-[88px] rounded-[12px] overflow-hidden border border-[var(--color-border)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] rotate-3"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=280&fit=crop&auto=format&q=80"
                alt="Team discussion" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.3)] to-transparent" />
            </motion.div>

            {/* Bottom-right accent image */}
            <motion.div
              className="absolute right-[10%] bottom-[6%] w-[140px] h-[92px] rounded-[12px] overflow-hidden border border-[var(--color-border)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] -rotate-3"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=280&fit=crop&auto=format&q=80"
                alt="Student celebrating success" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.3)] to-transparent" />
            </motion.div>

            {/* Decorative glow behind center image */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none -z-10"
              style={{ background: "radial-gradient(ellipse, rgba(124,111,255,0.12), transparent 65%)", filter: "blur(60px)" }} />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[180px] pointer-events-none z-[5]"
        style={{ background: "linear-gradient(to top, var(--color-bg), transparent)" }} />

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} aria-hidden>
        <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[var(--color-fg-subtle)]">scroll</span>
        <motion.div className="w-px h-8 bg-gradient-to-b from-[var(--color-brand)] to-transparent"
          animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }} />
      </motion.div>
    </section>
  );
}
