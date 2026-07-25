"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, BookOpen, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Map role → home dashboard path */
function getDashboardPath(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":      return "/admin";
    case "INSTRUCTOR": return "/instructor";
    case "MENTOR":     return "/mentor";
    case "MARKETING":  return "/marketing";
    case "SUPPORT":    return "/support";
    case "FINANCE":    return "/finance";
    default:           return "/dashboard";
  }
}

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

// Inner component uses useSearchParams — must be inside Suspense
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  useEffect(() => {
    const verified = params.get("verified");
    const errCode  = params.get("error");
    if (verified === "1") setSuccess("Email verified! You can now sign in.");
    if (errCode) {
      const messages: Record<string, string> = {
        OAuthAccountNotLinked: "This email is already registered with a different sign-in method.",
        CredentialsSignin:     "Incorrect email or password.",
        default:               "Something went wrong. Please try again.",
      };
      setError(messages[errCode] ?? messages.default);
    }
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError(res.error); return; }

    // Redirect based on role — fetch the session to get the role
    const session = await getSession();
    const role = (session?.user as any)?.role ?? "STUDENT";
    router.push(getDashboardPath(role));
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/auth-redirect" });
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] mesh-bg noise-overlay flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center shadow-[0_0_20px_rgba(124,111,255,0.4)]">
            <BookOpen size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-extrabold text-[1.2rem] text-[var(--color-fg)]" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-grad">CGS</span>
          </span>
        </Link>

        <div className="card p-7">
          <div className="text-center mb-6">
            <h1 className="font-display font-bold text-[1.4rem] text-[var(--color-fg)] mb-1" style={{ fontFamily: "var(--font-display)" }}>Welcome back</h1>
            <p className="text-[0.82rem] text-[var(--color-fg-muted)]">Sign in to continue learning</p>
          </div>

          {success && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 mb-4">
              <CheckCircle size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[0.78rem] text-emerald-300">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 mb-4">
              <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-[0.78rem] text-rose-300">{error}</p>
            </div>
          )}

          <button onClick={handleGoogle} disabled={googleLoading || loading}
            className="btn btn-outline w-full justify-center gap-2.5 mb-4 py-2.5 text-[0.82rem]">
            {googleLoading ? <Loader2 size={15} className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 divider" />
            <span className="text-[0.7rem] text-[var(--color-fg-subtle)]">or sign in with email</span>
            <div className="flex-1 divider" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] pointer-events-none" />
              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)} required className="input pl-9 text-[0.85rem]" />
            </div>

            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] pointer-events-none" />
              <input type={showPw ? "text" : "password"} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required className="input pl-9 pr-10 text-[0.85rem]" />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[0.75rem] text-[var(--color-brand-light)] hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading || googleLoading}
              className={cn("btn btn-brand w-full justify-center py-2.5 text-[0.85rem]", (loading || googleLoading) && "opacity-60 cursor-not-allowed")}>
              {loading ? <><Loader2 size={14} className="animate-spin" />Signing in…</> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[0.78rem] text-[var(--color-fg-muted)] mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[var(--color-brand-light)] hover:underline font-medium">Sign up free</Link>
          </p>
        </div>

        <p className="text-center text-[0.7rem] text-[var(--color-fg-subtle)] mt-6">
          By signing in you agree to our{" "}
          <Link href="/terms" className="hover:underline">Terms</Link> &amp;{" "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 size={28} className="text-[var(--color-brand)] animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
