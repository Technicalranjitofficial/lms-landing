"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ClipboardList, PlayCircle, Code2, Briefcase } from "lucide-react";

const steps = [
  {
    num: "01", icon: ClipboardList, title: "Choose Your Path",
    description: "Pick a course based on your goal — DSA, Full Stack, or the combined Sigma track for complete placement prep.",
    detail: "Tracks for every background — total beginner to CS grad refreshing for FAANG.",
  },
  {
    num: "02", icon: PlayCircle, title: "Learn with Live Classes",
    description: "Attend live sessions every alternate day at 8 PM. All sessions recorded for 2-year flexible access.",
    detail: "Miss a class? Watch the full recording at 2× before the next session.",
  },
  {
    num: "03", icon: Code2, title: "Practice & Build",
    description: "Solve 300+ curated problems, build real-world projects, and get code reviews from senior engineers.",
    detail: "Projects are industry-grade — add them directly to your resume and GitHub.",
  },
  {
    num: "04", icon: Briefcase, title: "Get Placed",
    description: "Resume workshops, mock interviews, and our placement network to land your dream job.",
    detail: "95%+ of placement-ready students get hired within 3 months.",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="section relative"
      style={{ background: "var(--color-bg-2)" }}>
      <div className="divider-grad absolute top-0 left-0 right-0" />
      <div className="divider-grad absolute bottom-0 left-0 right-0" />

      <div className="container relative z-10" ref={ref}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }} className="text-center mb-10">
          <span className="section-label justify-center">
            {/* Cyan = learning journey */}
            <span className="w-5 h-px" style={{ background: "#22d3ee" }} />
            How It Works
            <span className="w-5 h-px" style={{ background: "#22d3ee" }} />
          </span>
          <h2 className="section-title mx-auto">
            Your Journey to <span className="text-grad">Getting Hired</span>
          </h2>
          <p className="section-sub mx-auto text-center mt-3">
            A proven 4-step process that has helped 1,20,000+ students land their dream jobs.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* Connector line */}
          <div className="hiw-line hidden lg:block">
            <motion.div className="hiw-line-fill"
              initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }} />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.12, ease: "easeOut" }}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                className="card relative overflow-hidden flex flex-col p-5">

                {/* Subtle brand tint in corner */}
                <div className="absolute top-0 left-0 w-[120px] h-[120px] pointer-events-none"
                  style={{ background: "radial-gradient(circle at 0% 0%, rgba(124,111,255,0.08), transparent 65%)" }} />

                {/* Background number */}
                <div aria-hidden className="absolute right-[-4px] bottom-[-12px] font-display font-black
                  select-none pointer-events-none text-[6rem] leading-none"
                  style={{ color: "rgba(124,111,255,0.06)", fontFamily: "var(--font-display)" }}>
                  {step.num}
                </div>

                {/* Step number + icon row */}
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: i * 0.12 + 0.2, type: "spring", stiffness: 260, damping: 18 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-display font-black text-[1rem]"
                    style={{
                      fontFamily: "var(--font-display)",
                      // Step colors: 01=purple(choose), 02=cyan(learn), 03=cyan(build), 04=orange(placed)
                      background: ["rgba(124,111,255,0.12)","rgba(34,211,238,0.1)","rgba(34,211,238,0.1)","rgba(249,115,22,0.1)"][i],
                      border: `1px solid ${["rgba(124,111,255,0.3)","rgba(34,211,238,0.3)","rgba(34,211,238,0.3)","rgba(249,115,22,0.3)"][i]}`,
                      color: ["#7c6fff","#22d3ee","#22d3ee","#f97316"][i],
                    }}>
                    {step.num}
                  </motion.div>
                  <div className="w-10 h-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]
                    flex items-center justify-center">
                    <Icon size={20} strokeWidth={1.8}
                      style={{ color: ["#7c6fff","#22d3ee","#22d3ee","#f97316"][i] }} />
                  </div>
                </div>

                <h3 className="font-display font-extrabold text-[0.92rem] text-[var(--color-fg)] mb-1.5 relative z-10"
                  style={{ fontFamily: "var(--font-display)" }}>{step.title}</h3>
                <p className="text-[0.78rem] text-[var(--color-fg-muted)] leading-relaxed mb-3 relative z-10">
                  {step.description}
                </p>

                <div className="relative z-10 mt-auto rounded-xl px-4 py-3
                  bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                  style={{ borderLeft: `2px solid ${["#7c6fff","#22d3ee","#22d3ee","#f97316"][i]}` }}>
                  <p className="text-[0.78rem] text-[var(--color-fg-muted)]">{step.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.65, ease: "easeOut" }}
          className="card mt-8 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="font-display font-bold text-[1.1rem] text-[var(--color-fg)] mb-1"
              style={{ fontFamily: "var(--font-display)" }}>Ready to get started?</p>
            <p className="text-[0.83rem] text-[var(--color-fg-muted)]">Free consultation call. No commitment required.</p>
          </div>
          <a href="#courses" className="btn btn-brand">Book a Free Call →</a>
        </motion.div>
      </div>
    </section>
  );
}
