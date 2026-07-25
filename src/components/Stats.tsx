"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, motion } from "framer-motion";

// Context-driven colors: students=cyan, placed=orange, lectures=purple, satisfaction=green
const stats = [
  { value: 120000, suffix: "+", label: "Happy Students",  description: "Active learners on the platform", color: "#22d3ee" },
  { value: 2400,   suffix: "+", label: "Students Placed", description: "In top tech companies globally",  color: "#f97316" },
  { value: 150,    suffix: "+", label: "Video Lectures",  description: "High quality recorded content",   color: "#7c6fff" },
  { value: 98,     suffix: "%", label: "Satisfaction",    description: "Students recommend us",           color: "#34d399" },
];

function formatNum(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function CountUp({ target, duration = 2000, start }: { target: number; duration?: number; start: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return <>{formatNum(count)}</>;
}

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-10 sm:py-14 relative">
      <div className="divider-grad" />
      <div className="container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-border)] rounded-2xl overflow-hidden border border-[var(--color-border)]">
          {stats.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center py-7 px-5
                bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors duration-300 relative overflow-hidden">
              {/* Top accent line per stat */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-[50%] rounded-b-full"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
              <div className="font-display font-black tracking-[-0.05em] mb-1"
                style={{
                  fontSize: "clamp(1.8rem,3.5vw,2.5rem)",
                  color: stat.color,
                  fontFamily: "var(--font-display)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                <CountUp target={stat.value} start={inView} />
                {stat.suffix}
              </div>
              <p className="text-[0.8rem] font-semibold text-[var(--color-fg)] mb-0.5">{stat.label}</p>
              <p className="text-[0.68rem] text-[var(--color-fg-muted)]">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="divider-grad mt-16" />
    </section>
  );
}
