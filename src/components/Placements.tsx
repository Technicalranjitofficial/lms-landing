"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp } from "lucide-react";

const companies = [
  "Google", "Microsoft", "Amazon", "Meta", "Flipkart",
  "Razorpay", "Swiggy", "Zomato", "Paytm", "CRED",
  "Atlassian", "Salesforce", "Uber", "Adobe", "Walmart",
  "Infosys", "TCS", "Wipro", "Accenture", "Capgemini",
];

const marqueeItems = [...companies, ...companies];

// Package badge = orange (high-value achievement), avatar border = neutral
const students = [
  { name: "Arjun S.",  role: "SDE-1 @ Google",      package: "₹42 LPA", initials: "AS",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&auto=format" },
  { name: "Priya M.",  role: "Frontend @ Razorpay",  package: "₹28 LPA", initials: "PM",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b131?w=80&h=80&fit=crop&crop=face&auto=format" },
  { name: "Rohit K.",  role: "Backend @ Swiggy",     package: "₹24 LPA", initials: "RK",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&auto=format" },
  { name: "Neha G.",   role: "Full Stack @ CRED",    package: "₹31 LPA", initials: "NG",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face&auto=format" },
  { name: "Dev P.",    role: "SDE-2 @ Microsoft",    package: "₹55 LPA", initials: "DP",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face&auto=format" },
  { name: "Anika R.",  role: "SDE-1 @ Flipkart",    package: "₹26 LPA", initials: "AR",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face&auto=format" },
];

export default function Placements() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="placements" className="section" ref={ref}>
      <div className="container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }} className="text-center mb-14">
          <span className="section-label justify-center">
            <span className="w-5 h-px" style={{ background: "#f97316" }} />
            Placements
            <span className="w-5 h-px" style={{ background: "#f97316" }} />
          </span>
          <h2 className="section-title">
            Our Students Work at{" "}
            {/* Orange for achievement context */}
            <span style={{
              background: "linear-gradient(130deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>
              Dream Companies
            </span>
          </h2>
          <p className="section-sub mx-auto text-center mt-3">
            2,400+ students placed in top MNCs and startups across India and abroad.
          </p>
        </motion.div>

        {/* Marquee */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }} className="mb-14">
          <div className="marquee-wrap">
            <div className="marquee-track gap-0 py-1">
              {marqueeItems.map((name, i) => (
                <div key={`${name}-${i}`}
                  className="flex items-center gap-3 px-6 py-2.5 mx-1.5 rounded-xl whitespace-nowrap flex-shrink-0
                    border border-[var(--color-border)] bg-[var(--color-surface)]
                    hover:border-[rgba(249,115,22,0.3)] transition-colors duration-200 cursor-default">
                  {/* Orange dot — placement/achievement context */}
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#f97316" }} />
                  <span className="text-[0.8rem] font-semibold text-[var(--color-fg-muted)]">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Placed students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}>
          <div className="flex items-center justify-center gap-2 mb-8">
            <TrendingUp size={14} style={{ color: "#f97316" }} />
            <p className="text-[0.72rem] text-[var(--color-fg-subtle)] uppercase tracking-widest font-bold">
              Recent Placements
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {students.map((s, i) => (
              <motion.div key={s.name}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.07, ease: "easeOut" }}
                whileHover={{ y: -4 }}
                className="card flex flex-col items-center text-center p-4 gap-2 cursor-default">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--color-border-2)]">
                  <img src={s.avatar} alt={s.name} className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const p = el.parentElement;
                      if (p) {
                        p.style.background = "#f97316";
                        p.style.display = "flex";
                        p.style.alignItems = "center";
                        p.style.justifyContent = "center";
                        p.innerHTML = `<span style="color:white;font-size:0.75rem;font-weight:700">${s.initials}</span>`;
                      }
                    }} />
                </div>
                <div>
                  <p className="text-[0.78rem] font-bold text-[var(--color-fg)]">{s.name}</p>
                  <p className="text-[0.66rem] text-[var(--color-fg-muted)] leading-tight mt-0.5">{s.role}</p>
                </div>
                {/* Orange package badge — achievement */}
                <span className="text-[0.68rem] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.25)",
                    color: "#f97316"
                  }}>
                  {s.package}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
