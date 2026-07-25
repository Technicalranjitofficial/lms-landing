"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle, XCircle, Loader2, MailCheck } from "lucide-react";

type Status = "verifying" | "success" | "error" | "waiting";

const ERROR_MESSAGES: Record<string, string> = {
  missing_token:      "The verification link is missing a token. Please use the link from your email.",
  invalid_or_expired: "This verification link has expired or already been used. Request a new one below.",
};

function VerifyEmailContent() {
  const params = useSearchParams();
  const token  = params.get("token");
  const error  = params.get("error");

  const [status, setStatus]   = useState<Status>(token ? "verifying" : error ? "error" : "waiting");
  const [message, setMessage] = useState(error ? (ERROR_MESSAGES[error] ?? "Verification failed.") : "");

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.message) { setStatus("success"); }
        else { setStatus("error"); setMessage(data.error ?? "Verification failed."); }
      })
      .catch(() => { setStatus("error"); setMessage("Network error. Please try again."); });
  }, [token]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] mesh-bg noise-overlay flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand)] flex items-center justify-center shadow-[0_0_20px_rgba(124,111,255,0.4)]">
            <BookOpen size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-extrabold text-[1.2rem] text-[var(--color-fg)]" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-grad">CGS</span>
          </span>
        </Link>

        <div className="card p-8 text-center">
          {status === "verifying" && (
            <>
              <Loader2 size={40} className="text-[var(--color-brand)] animate-spin mx-auto mb-5" />
              <h1 className="font-display font-bold text-[1.2rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Verifying your email…</h1>
              <p className="text-[0.8rem] text-[var(--color-fg-muted)]">Just a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-emerald-400" />
              </div>
              <h1 className="font-display font-bold text-[1.3rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Email verified!</h1>
              <p className="text-[0.82rem] text-[var(--color-fg-muted)] mb-6">Your account is now active. Sign in to start learning.</p>
              <Link href="/login?verified=1" className="btn btn-brand w-full justify-center py-2.5 text-[0.85rem]">Sign In Now</Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto mb-5">
                <XCircle size={30} className="text-rose-400" />
              </div>
              <h1 className="font-display font-bold text-[1.3rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Verification failed</h1>
              <p className="text-[0.82rem] text-[var(--color-fg-muted)] mb-6">{message}</p>
              <Link href="/register" className="btn btn-brand w-full justify-center py-2.5 text-[0.85rem] mb-3">Register Again</Link>
              <Link href="/login" className="btn btn-outline w-full justify-center py-2.5 text-[0.82rem]">Back to Sign In</Link>
            </>
          )}

          {status === "waiting" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-dim)] border border-[var(--color-border-brand)] flex items-center justify-center mx-auto mb-5">
                <MailCheck size={28} className="text-[var(--color-brand-light)]" />
              </div>
              <h1 className="font-display font-bold text-[1.3rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Check your inbox</h1>
              <p className="text-[0.82rem] text-[var(--color-fg-muted)] leading-relaxed mb-6">
                We sent you a verification email. Click the link inside to activate your account.
                The link expires in 24 hours — check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/login" className="btn btn-outline w-full justify-center py-2.5 text-[0.82rem]">Back to Sign In</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 size={28} className="text-[var(--color-brand)] animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
