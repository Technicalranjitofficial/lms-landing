"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do I need prior coding experience to join?",
    a: "No prior experience needed for most courses. Alpha Plus and Delta start from complete basics — variables, loops, and functions. The Sigma batch assumes basic programming knowledge. We have a free pre-course primer to help you get ready.",
  },
  {
    q: "Can I access lectures at my own pace?",
    a: "Yes. All lectures are recorded and available 24/7 for your batch's access duration (2 years). Live sessions are scheduled but recordings go up within a few hours. You can learn at any time that suits you.",
  },
  {
    q: "What is the 1-on-1 doubt support?",
    a: "Every batch has dedicated Teaching Assistants (TAs) who hold live doubt sessions. You can raise a doubt ticket at any time and a TA will connect with you for a live call to resolve it — usually within 1–2 hours during active hours.",
  },
  {
    q: "Is the certificate recognized by companies?",
    a: "Our certificates are industry-recognized and have been accepted by 200+ companies. More importantly, we focus on building real skills — the projects, coding problems, and placement prep you do will matter more than any certificate.",
  },
  {
    q: "What is the batch duration and course validity?",
    a: "Course durations range from 4 to 8.5 months depending on the batch. All course content (recordings, notes, problem sets) remains accessible for 2 years after you purchase, so you can revise at any time.",
  },
  {
    q: "Is there a placement guarantee?",
    a: "We don't offer a 'money-back' placement guarantee, but we do offer robust placement support: resume workshops, mock interviews, referrals, and a placement network of 200+ hiring partners. 95%+ of our placement-ready students get hired within 3 months.",
  },
  {
    q: "Can I switch between batches after enrollment?",
    a: "You can upgrade from a lower tier (Alpha) to a higher tier (Sigma) by paying the difference within the first 30 days. Downgrading is not supported. Contact support for batch-specific transfer queries.",
  },
  {
    q: "What payment options are available?",
    a: "We accept UPI, credit/debit cards, net banking, and EMI options through Razorpay. EMI plans start from ₹999/month with zero processing fees on select banks. No-cost EMI is available for 3, 6, and 12 month tenures.",
  },
];

function FAQItem({ q, a, index, inView }: { q: string; a: string; index: number; inView: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.06, ease: "easeOut" }}
      className="faq-item"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span
          className={cn(
            "text-[0.95rem] font-semibold transition-colors duration-200",
            open ? "text-[var(--color-brand-light)]" : "text-[var(--color-fg)]"
          )}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "text-[var(--color-fg-muted)] flex-shrink-0 ml-4 transition-transform duration-300",
            open ? "rotate-180 text-[var(--color-brand-light)]" : ""
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[0.87rem] text-[var(--color-fg-muted)] leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" className="section" ref={ref}>
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-20 items-start">
          {/* Left — sticky header */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:sticky lg:top-[100px]"
          >
            <span className="section-label">
              <span className="w-4 h-[2px] bg-[var(--color-brand)]" />
              FAQ
            </span>
            <h2 className="section-title">
              Got{" "}
              <span className="text-grad">Questions?</span>
              <br />
              We&apos;ve Got Answers.
            </h2>
            <p className="section-sub mt-4">
              Everything you need to know before enrolling. Can&apos;t find what you&apos;re looking for?
            </p>
            <a
              href="mailto:hello@codepath.in"
              className="btn btn-outline mt-6 text-[0.86rem] py-[11px] px-6"
            >
              Contact Support
            </a>
          </motion.div>

          {/* Right — accordion */}
          <div>
            {faqs.map((item, i) => (
              <FAQItem key={item.q} q={item.q} a={item.a} index={i} inView={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
