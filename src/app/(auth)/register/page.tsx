"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Eye, EyeOff, Mail, Lock, User, BookOpen,
  Loader2, CheckCircle, AlertCircle,
  MailCheck,
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
import { cn } from "@/lib/utils";

type Step = "form" | "verify-notice";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep]         = useState<Step>("form");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState("");

  // Password strength
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strengthScore = strength.filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strengthScore];
  const strengthColor = ["", "bg-rose-500", "bg-amber-500", "bg-cyan-500", "bg-emerald-500"][strengthScore];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPw) {
      setError("Passwords don't match");
      return;
    }
    if (strengthScore < 2) {
      setError("Please choose a stronger password");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      return;
    }

    // Show email verification notice
    setStep("verify-notice");
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  // ── Verify notice screen ──────────────────────────────────────────────────
  if (step === "verify-notice") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] mesh-bg noise-overlay flex items-center justify-center p-4">
        <div className="w-full max-w-[420px]">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-dim)] border border-[var(--color-border-brand)] flex items-center justify-center mx-auto mb-5">
              <MailCheck size={28} className="text-[var(--color-brand-light)]" />
            </div>
            <h1 className="font-display font-bold text-[1.3rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Check your email
            </h1>
            <p className="text-[0.82rem] text-[var(--color-fg-muted)] leading-relaxed mb-2">
              We sent a verification link to
            </p>
            <p className="text-[0.9rem] font-semibold text-[var(--color-brand-light)] mb-5">{email}</p>
            <p className="text-[0.78rem] text-[var(--color-fg-subtle)] leading-relaxed mb-6">
              Click the link in the email to activate your account. The link expires in 24 hours.
              Check your spam folder if you don&apos;t see it.
            </p>
            <Link href="/login" className="btn btn-brand w-full justify-center py-2.5 text-[0.84rem]">
              Go to Sign In
            </Link>
            <button
              onClick={() => setStep("form")}
              className="mt-3 text-[0.75rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--color-bg)] mesh-bg noise-overlay flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center shadow-[0_0_20px_rgba(124,111,255,0.4)]">
            <BookOpen size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-extrabold text-[1.2rem] text-[var(--color-fg)]" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-grad">CGS</span>
          </span>
        </Link>

        <div className="card p-7">
          <div className="text-center mb-6">
            <h1 className="font-display font-bold text-[1.4rem] text-[var(--color-fg)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Create your account
            </h1>
            <p className="text-[0.82rem] text-[var(--color-fg-muted)]">Start learning for free today</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 mb-4">
              <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-[0.78rem] text-rose-300">{error}</p>
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="btn btn-outline w-full justify-center gap-2.5 mb-4 py-2.5 text-[0.82rem]"
          >
            {googleLoading ? <Loader2 size={15} className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 divider" />
            <span className="text-[0.7rem] text-[var(--color-fg-subtle)]">or register with email</span>
            <div className="flex-1 divider" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] pointer-events-none" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="input pl-9 text-[0.85rem]"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] pointer-events-none" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input pl-9 text-[0.85rem]"
              />
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input pl-9 pr-10 text-[0.85rem]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-[3px] flex-1 rounded-full transition-all duration-300",
                          i < strengthScore ? strengthColor : "bg-[var(--color-surface-3)]"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn("text-[0.68rem]",
                    strengthScore <= 1 && "text-rose-400",
                    strengthScore === 2 && "text-amber-400",
                    strengthScore === 3 && "text-cyan-400",
                    strengthScore === 4 && "text-emerald-400",
                  )}>
                    {strengthLabel}
                    {strengthScore < 3 && " — add uppercase, numbers, or symbols"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
                className={cn(
                  "input pl-9 text-[0.85rem]",
                  confirmPw && confirmPw !== password && "border-rose-500/60 focus:border-rose-500"
                )}
              />
              {confirmPw && confirmPw === password && (
                <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className={cn("btn btn-brand w-full justify-center py-2.5 text-[0.85rem] mt-1", (loading || googleLoading) && "opacity-60 cursor-not-allowed")}
            >
              {loading ? <><Loader2 size={14} className="animate-spin" />Creating account…</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[0.78rem] text-[var(--color-fg-muted)] mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-brand-light)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[0.7rem] text-[var(--color-fg-subtle)] mt-6">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="hover:underline">Terms</Link> &amp;{" "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
