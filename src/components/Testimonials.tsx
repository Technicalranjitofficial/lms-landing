"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Verma", role: "SDE-1 @ Amazon", initials: "RV", course: "Sigma Batch", package: "₹38 LPA",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face&auto=format",
    text: "CodePath's Sigma batch completely transformed my DSA skills. The structured approach and live doubt sessions helped me crack Amazon's interview in just 4 months. Instructors genuinely care about your success.",
  },
  {
    name: "Sneha Patil", role: "Frontend Dev @ Razorpay", initials: "SP", course: "Delta Batch", package: "₹26 LPA",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b131?w=96&h=96&fit=crop&crop=face&auto=format",
    text: "Delta batch is the best full-stack course I've taken. The MERN projects are real-world quality. Code reviews from TAs were invaluable. I went from zero to employed in 5 months.",
  },
  {
    name: "Karthik R.", role: "SDE @ Microsoft", initials: "KR", course: "Alpha Plus", package: "₹48 LPA",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face&auto=format",
    text: "Alpha Plus is incredibly thorough — 400+ problems, each explained with multiple approaches. I used to struggle with graphs and DP. After this course, they're my strongest topics. Got 3 offers.",
  },
  {
    name: "Ananya Singh", role: "Backend Eng @ Swiggy", initials: "AS", course: "Sigma Batch", package: "₹24 LPA",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=face&auto=format",
    text: "The community and support system sets CodePath apart. Telegram groups are super active, doubt sessions happen within hours, and mentorship was a game-changer for my placement prep.",
  },
  {
    name: "Vikram Nair", role: "Full Stack Dev @ CRED", initials: "VN", course: "Delta Batch", package: "₹30 LPA",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face&auto=format",
    text: "Non-CS background, was worried about catching up. Delta batch pacing was perfect — from HTML all the way to deploying full-stack apps. Best investment I've made in myself.",
  },
  {
    name: "Meera Joshi", role: "SDE-1 @ Flipkart", initials: "MJ", course: "Alpha Plus", package: "₹22 LPA",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face&auto=format",
    text: "The 1-on-1 doubt support is phenomenal. Never felt stuck for long. TAs are knowledgeable and patient. The most flexible high-quality course I've encountered.",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" className="section" ref={ref}>
      <div className="container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }} className="text-center mb-10">
          <span className="section-label justify-center">
            <span className="w-5 h-px bg-[var(--color-brand)]" />
            Student Reviews
            <span className="w-5 h-px bg-[var(--color-brand)]" />
          </span>
          <h2 className="section-title">
            Stories of <span className="text-grad">Real Success</span>
          </h2>
          {/* Amber stars — quality signal */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} style={{ fill: "#fbbf24", color: "#fbbf24" }} />
              ))}
            </div>
            <span className="font-semibold text-[var(--color-fg)] text-[0.95rem]">4.9</span>
            <span className="text-[0.8rem] text-[var(--color-fg-muted)]">from 8,400+ reviews</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 24 } }}
              className="card flex flex-col gap-3 p-5">

              {/* Purple quote — brand */}
              <Quote size={24} className="opacity-30" style={{ color: "#7c6fff" }} />

              {/* Amber stars — quality/rating */}
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={12} style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                ))}
              </div>

              <p className="text-[0.8rem] text-[var(--color-fg-muted)] leading-[1.75] flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Orange package badge — achievement */}
              <div className="flex items-center gap-2">
                <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.22)",
                    color: "#f97316"
                  }}>
                  {t.package}
                </span>
                <span className="text-[0.68rem] text-[var(--color-fg-subtle)]">{t.course}</span>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[var(--color-border-2)]">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const p = el.parentElement;
                      if (p) {
                        p.style.background = "#7c6fff";
                        p.style.display = "flex";
                        p.style.alignItems = "center";
                        p.style.justifyContent = "center";
                        p.innerHTML = `<span style="color:white;font-size:0.72rem;font-weight:700">${t.initials}</span>`;
                      }
                    }} />
                </div>
                <div>
                  <p className="text-[0.86rem] font-bold text-[var(--color-fg)]">{t.name}</p>
                  <p className="text-[0.73rem] text-[var(--color-fg-muted)]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
