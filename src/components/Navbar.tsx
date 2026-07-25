"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Sun, Moon, BookOpen, ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuthContext } from "./AuthProvider";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Placements", href: "#placements" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, loading, logout } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Get initials for avatar fallback
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
          scrolled
            ? "py-3 backdrop-blur-xl border-b border-[var(--color-border)]"
            : "py-5",
          scrolled && theme === "dark"
            ? "bg-[rgba(9,9,15,0.85)]"
            : scrolled && theme === "light"
            ? "bg-[rgba(248,248,255,0.9)]"
            : "bg-transparent"
        )}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0 group" aria-label="CGS Home">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center shadow-lg shadow-[var(--color-brand-glow)] group-hover:scale-105 transition-transform duration-200">
              <BookOpen size={16} className="text-white sm:hidden" strokeWidth={2.5} />
              <BookOpen size={18} className="text-white hidden sm:block" strokeWidth={2.5} />
            </div>
            <span
              className="font-display font-800 text-[1rem] sm:text-[1.15rem] tracking-[-0.03em] text-[var(--color-fg)] whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-grad">CGS</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-[0.86rem] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] rounded-lg hover:bg-[var(--color-surface-2)] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] transition-all duration-200"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Desktop only buttons - hidden on mobile/tablet */}
            <div className="hidden lg:flex items-center gap-2">
              {loading ? (
                // Skeleton while session hydrates — prevents flash of wrong state
                <div className="w-20 h-9 rounded-lg bg-[var(--color-surface-2)] animate-pulse" />
              ) : isAuthenticated && user ? (
                // ── Authenticated ────────────────────────────────────────────
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-brand)] hover:bg-[var(--color-surface-2)] transition-all duration-200"
                  >
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white text-[0.62rem] font-bold">
                        {initials}
                      </div>
                    )}
                    <span className="text-[0.82rem] font-medium text-[var(--color-fg)] max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={13} className={cn("text-[var(--color-fg-muted)] transition-transform duration-200", userMenuOpen && "rotate-180")} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50">
                      <div className="p-3 border-b border-[var(--color-border)]">
                        <p className="text-[0.78rem] font-semibold text-[var(--color-fg)] truncate">{user.name}</p>
                        <p className="text-[0.7rem] text-[var(--color-fg-muted)] truncate">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <a href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.8rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-all">
                          <LayoutDashboard size={14} />My Dashboard
                        </a>
                        <a href="/dashboard/courses"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.8rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-all">
                          <User size={14} />My Courses
                        </a>
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.8rem] text-rose-400 hover:bg-rose-500/10 transition-all">
                          <LogOut size={14} />Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // ── Unauthenticated ──────────────────────────────────────────
                <>
                  <a href="/login" className="btn btn-ghost text-[0.84rem] py-[9px] px-4 text-[var(--color-fg-muted)]">
                    Log In
                  </a>
                  <a href="/courses" className="btn btn-brand text-[0.84rem] py-[10px] px-5">
                    Start Learning
                  </a>
                </>
              )}
            </div>

            {/* Hamburger - visible on mobile/tablet */}
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] transition-all duration-200"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[110] lg:hidden transition-all duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-[var(--color-bg)] border-l border-[var(--color-border)] flex flex-col transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
            <span
              className="font-display font-800 text-[1.05rem] text-[var(--color-fg)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Menu
            </span>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-[0.92rem] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] rounded-xl hover:bg-[var(--color-surface-2)] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="p-4 border-t border-[var(--color-border)] flex flex-col gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {loading ? (
              <div className="h-10 rounded-lg bg-[var(--color-surface-2)] animate-pulse" />
            ) : isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white text-[0.65rem] font-bold">{initials}</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[0.8rem] font-semibold text-[var(--color-fg)] truncate">{user.name}</p>
                    <p className="text-[0.68rem] text-[var(--color-fg-muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <a href="/dashboard" onClick={() => setOpen(false)}
                  className="btn btn-outline w-full justify-center text-[0.88rem] py-3 gap-2">
                  <LayoutDashboard size={15} />Dashboard
                </a>
                <button onClick={() => { setOpen(false); logout(); }}
                  className="btn w-full justify-center text-[0.88rem] py-3 gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20">
                  <LogOut size={15} />Sign Out
                </button>
              </>
            ) : (
              <>
                <a href="/login" onClick={() => setOpen(false)}
                  className="btn btn-outline w-full justify-center text-[0.88rem] py-3">
                  Log In
                </a>
                <a href="/courses" onClick={() => setOpen(false)}
                  className="btn btn-brand w-full justify-center text-[0.88rem] py-3">
                  Start Learning
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
