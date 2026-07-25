"use client";

import { BookOpen, Globe, GitFork, Link, Video, MessageCircle, Send, ArrowRight, Heart } from "lucide-react";

const footerLinks = {
  Courses: [
    { label: "Sigma — Full Stack + DSA", href: "/courses" },
    { label: "Alpha Plus — DSA", href: "/courses" },
    { label: "Delta — Web Dev", href: "/courses" },
    { label: "AI & ML (Coming Soon)", href: "/courses" },
    { label: "System Design", href: "/courses" },
  ],
  Platform: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Placements", href: "#placements" },
    { label: "Student Reviews", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "All Courses", href: "/courses" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Partners", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Refund Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const social = [
  { icon: Video,         href: "#", label: "YouTube" },
  { icon: Globe,         href: "#", label: "Twitter/X" },
  { icon: MessageCircle, href: "#", label: "Instagram" },
  { icon: GitFork,       href: "#", label: "GitHub" },
  { icon: Link,          href: "#", label: "LinkedIn" },
  { icon: Send,          href: "#", label: "Telegram" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0b0b14]">
      {/* Top gradient divider line */}
      <div className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, #7c6fff, #22d3ee, #a78bfa, #7c6fff)" }} />

      {/* Decorative elements */}
      <div aria-hidden className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(124,111,255,0.06), transparent 65%)", filter: "blur(80px)" }} />
      <div aria-hidden className="absolute bottom-[-150px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.04), transparent 65%)", filter: "blur(60px)" }} />

      {/* Spacer from top divider */}
      <div className="h-12 sm:h-16" />

      <div className="container relative z-10 pb-14 sm:pb-16">
        {/* Top section — Brand + Newsletter */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12 pb-10 border-b border-[rgba(255,255,255,0.1)]">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2.5 mb-3 group w-fit" aria-label="CGS">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand)] flex items-center justify-center shadow-lg shadow-[var(--color-brand-glow)] group-hover:scale-105 transition-transform">
                <BookOpen size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div style={{ fontFamily: "var(--font-display)" }}>
                <span className="font-display font-extrabold text-[1.25rem] tracking-[-0.03em] text-grad">CGS</span>
                <p className="text-[0.6rem] font-semibold text-[rgba(255,255,255,0.4)] tracking-wide -mt-0.5">CG School of Technology</p>
              </div>
            </a>
            <p className="text-[0.88rem] text-[rgba(255,255,255,0.5)] leading-relaxed max-w-[320px]">
              India&apos;s most structured tech education platform. Learn software development, DSA, and crack placements.
            </p>
          </div>

          {/* Newsletter */}
          <div className="w-full lg:w-auto lg:max-w-[420px]">
            <p className="font-display font-bold text-[1rem] text-white mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}>
              Get free DSA tips & placement updates
            </p>
            <p className="text-[0.78rem] text-[rgba(255,255,255,0.45)] mb-3">
              Join 20,000+ subscribers. No spam, unsubscribe anytime.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 sm:w-[240px] py-[11px] px-4 text-[0.85rem] rounded-xl
                  bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                  text-white placeholder:text-[rgba(255,255,255,0.3)]
                  focus:border-[rgba(124,111,255,0.5)] focus:shadow-[0_0_0_3px_rgba(124,111,255,0.1)]
                  outline-none transition-all duration-200"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="btn btn-brand py-[11px] px-5 text-[0.84rem] whitespace-nowrap">
                Subscribe <ArrowRight size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 mb-12">
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-[0.7rem] font-bold text-[rgba(255,255,255,0.9)] uppercase tracking-[0.15em] mb-4">
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}
                      className="text-[0.82rem] text-[rgba(255,255,255,0.45)] hover:text-white transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social + Bottom bar */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {social.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center
                    text-[rgba(255,255,255,0.4)] hover:text-white
                    bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]
                    hover:border-[rgba(124,111,255,0.3)] hover:bg-[rgba(124,111,255,0.08)]
                    transition-all duration-200">
                  <Icon size={15} />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-[0.76rem] text-[rgba(255,255,255,0.35)] flex items-center gap-1.5">
              © 2026 CG School of Technology (CGS). All rights reserved. Made with
              <Heart size={11} className="text-[#fb7185] fill-[#fb7185]" />
              in India.
            </p>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
              <span className="text-[0.73rem] text-[rgba(255,255,255,0.4)]">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
