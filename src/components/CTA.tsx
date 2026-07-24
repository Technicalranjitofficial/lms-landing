"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Zap, Users, Trophy, BookOpen, CheckCircle, Star } from "lucide-react";

const stats = [
  { icon: Users,    value: "1,20,000+", label: "Students",  color: "#22d3ee", dim: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.2)"  },
  { icon: Trophy,   value: "2,400+",    label: "Placed",    color: "#f97316", dim: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.2)"  },
  { icon: Star,     value: "4.9/5",     label: "Rating",    color: "#fbbf24", dim: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)"  },
  { icon: BookOpen, value: "150+",      label: "Lectures",  color: "#7c6fff", dim: "rgba(124,111,255,0.12)", border: "rgba(124,111,255,0.25)" },
];

const perks = [
  "Free demo class — no signup needed",
  "7-day full refund, no questions asked",
  "No-cost EMI from ₹999/month",
  "2-year course access included",
];

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="shimmer-border">
          <div className="relative overflow-hidden rounded-[24px]"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(124,111,255,0.1)" }}>

            <div className="grid lg:grid-cols-[1.3fr_1fr] relative">

              {/* ═══ LEFT — Dark side ═══ */}
              <div className="relative overflow-hidden bg-[#0b0b14] p-8 sm:p-12 lg:p-14 lg:pr-16">
                {/* Decorative floating circles */}
                <div aria-hidden className="absolute top-8 right-8 w-[180px] h-[180px] rounded-full border border-[rgba(124,111,255,0.1)] pointer-events-none" />
                <div aria-hidden className="absolute top-14 right-14 w-[120px] h-[120px] rounded-full border border-[rgba(124,111,255,0.06)] pointer-events-none" />
                <div aria-hidden className="absolute bottom-[-30px] left-[-30px] w-[200px] h-[200px] rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(34,211,238,0.06), transparent 65%)" }} />

                {/* Brand glow */}
                <div aria-hidden className="absolute top-[-20%] left-[-10%] w-[450px] h-[450px] rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(ellipse, rgba(124,111,255,0.14), transparent 65%)", filter: "blur(80px)" }} />

                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    maskImage: "radial-gradient(ellipse 80% 80% at 30% 40%, black 10%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 30% 40%, black 10%, transparent 70%)",
                  }} />

                {/* Decorative gradient line accent */}
                <div aria-hidden className="absolute top-0 left-8 right-8 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(124,111,255,0.4), rgba(34,211,238,0.3), transparent)" }} />

                <div className="relative z-10">
                  {/* Cyan badge */}
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[0.74rem] font-semibold
                    border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.08)] text-[#22d3ee]">
                    <Zap size={11} className="fill-current" />
                    Limited Seats — Sigma 12 Batch Open
                  </span>

                  <h2 className="font-display font-black text-[clamp(2rem,4vw,2.8rem)]
                    text-white tracking-[-0.05em] leading-[1.08] mb-5"
                    style={{ fontFamily: "var(--font-display)" }}>
                    Start Your Coding
                    <br />
                    Journey <span className="text-shimmer">Today</span>
                  </h2>

                  <p className="text-[rgba(255,255,255,0.6)] text-[0.92rem] leading-relaxed mb-8 max-w-[400px]">
                    Join 1,20,000+ students who transformed their careers with CodePath.
                    Live classes start this week.
                  </p>

                  {/* Perks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                    {perks.map(p => (
                      <div key={p} className="flex items-center gap-2 text-[0.8rem] text-[rgba(255,255,255,0.55)]">
                        <CheckCircle size={14} className="text-[#34d399] flex-shrink-0" strokeWidth={2.5} />
                        {p}
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <a href="#courses" className="btn btn-brand text-[0.9rem] py-[12px] px-7 gap-2">
                      Enroll Now <ArrowRight size={15} />
                    </a>
                    <a href="#how-it-works" className="inline-flex items-center gap-2 py-[12px] px-6
                      text-[0.9rem] font-semibold rounded-xl border border-[rgba(255,255,255,0.12)]
                      text-white/80 hover:text-white hover:bg-[rgba(255,255,255,0.06)]
                      hover:border-[rgba(255,255,255,0.22)] transition-all duration-200">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>

              {/* ═══ RIGHT — White side with curved left edge ═══ */}
              <div className="relative p-8 sm:p-10 lg:p-12 lg:pl-14 bg-white lg:-ml-8 lg:rounded-l-[40px]">
                {/* Subtle gradient blob */}
                <div aria-hidden className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(ellipse, rgba(124,111,255,0.04), transparent 65%)", filter: "blur(50px)" }} />

                <div className="relative z-10 flex flex-col gap-4 h-full justify-center">
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map(({ icon: Icon, value, label, color, dim, border }) => (
                      <motion.div key={label}
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="p-5 flex flex-col gap-1.5 cursor-default rounded-[16px]
                          bg-[#f8f8fc] border border-[rgba(0,0,0,0.06)]
                          hover:border-[rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]
                          transition-all duration-200">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: dim, border: `1px solid ${border}` }}>
                          <Icon size={15} style={{ color }} />
                        </div>
                        <span className="font-display font-black text-[1.4rem] tracking-tight"
                          style={{ fontFamily: "var(--font-display)", color }}>
                          {value}
                        </span>
                        <span className="text-[0.72rem] font-medium text-[#6b7280]">{label}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mini testimonial */}
                  <div className="p-4 flex items-start gap-3 rounded-[16px]
                    bg-[#f8f8fc] border border-[rgba(0,0,0,0.06)]">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face&auto=format"
                      alt="Student review"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[rgba(0,0,0,0.08)]"
                    />
                    <div>
                      <p className="text-[0.8rem] text-[#4b5563] leading-relaxed">
                        &ldquo;Cracked Amazon in 4 months. Best decision I ever made.&rdquo;
                      </p>
                      <p className="text-[0.7rem] font-semibold mt-1.5 text-[#f97316]">
                        Rahul V. — SDE-1 @ Amazon · ₹38 LPA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
