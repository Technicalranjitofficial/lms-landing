"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle, XCircle, Loader2, Shield, Award,
  Calendar, Hash, User, BookOpen, ArrowLeft, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifyResult {
  valid: boolean;
  certificate: {
    id: string;
    certificateNumber: string;
    issuedAt: string;
    user:   { name: string };
    course: { title: string };
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyCertificatePage() {
  const { certNumber } = useParams<{ certNumber: string }>();

  const [result,  setResult]  = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!certNumber) return;
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api";
    fetch(`${API}/certificates/verify/${encodeURIComponent(certNumber)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? "Certificate not found");
        }
        return res.json() as Promise<VerifyResult>;
      })
      .then(setResult)
      .catch((e) => setError(e.message ?? "Verification failed"))
      .finally(() => setLoading(false));
  }, [certNumber]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Minimal nav */}
      <header className="h-14 border-b border-[var(--color-border)] flex items-center px-6 gap-3">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors text-[0.82rem]">
          <ArrowLeft size={14} /> Home
        </Link>
        <span className="text-[var(--color-fg-subtle)]">/</span>
        <span className="text-[0.82rem] text-[var(--color-fg-muted)]">Verify Certificate</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-dim)] flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-[var(--color-brand)]" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-[var(--color-fg)]">Verifying certificate…</p>
                <p className="text-[0.82rem] text-[var(--color-fg-muted)] mt-1">Checking {certNumber}</p>
              </div>
            </div>
          )}

          {/* Valid */}
          {!loading && result?.valid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-5"
            >
              {/* Status banner */}
              <div className="rounded-2xl p-5 flex items-center gap-4 border"
                style={{
                  background: "rgba(22,163,74,0.08)",
                  borderColor: "rgba(22,163,74,0.25)",
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(22,163,74,0.15)" }}>
                  <CheckCircle size={24} className="text-[var(--color-green)]" />
                </div>
                <div>
                  <p className="font-display font-black text-lg text-[var(--color-green)]">Verified ✓</p>
                  <p className="text-[0.78rem] text-[var(--color-fg-muted)] mt-0.5">
                    This certificate is authentic and was issued by CG School of Technology.
                  </p>
                </div>
              </div>

              {/* Certificate details card */}
              <div className="card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-dim)] flex items-center justify-center shrink-0">
                    <Award size={20} className="text-[var(--color-brand)]" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[0.9rem] text-[var(--color-fg)]">
                      Certificate of Completion
                    </p>
                    <p className="text-[0.7rem] text-[var(--color-fg-muted)]">CG School of Technology</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  {[
                    {
                      icon: User,
                      label: "Issued To",
                      value: result.certificate.user.name,
                      highlight: true,
                    },
                    {
                      icon: BookOpen,
                      label: "Course",
                      value: result.certificate.course.title,
                      highlight: false,
                    },
                    {
                      icon: Calendar,
                      label: "Date of Issue",
                      value: fmtDate(result.certificate.issuedAt),
                      highlight: false,
                    },
                    {
                      icon: Hash,
                      label: "Certificate Number",
                      value: result.certificate.certificateNumber,
                      mono: true,
                      highlight: false,
                    },
                  ].map(({ icon: Icon, label, value, highlight, mono }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={13} className="text-[var(--color-fg-muted)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-semibold text-[var(--color-fg-subtle)] uppercase tracking-wider">
                          {label}
                        </p>
                        <p className={cn(
                          "mt-0.5 leading-snug",
                          highlight
                            ? "font-display font-bold text-[1rem] text-[var(--color-fg)]"
                            : "text-[0.86rem] text-[var(--color-fg)]",
                          mono && "font-mono text-[0.8rem]"
                        )}>
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shield badge */}
                <div className="pt-3 border-t border-[var(--color-border)] flex items-center gap-2">
                  <Shield size={13} className="text-[var(--color-green)]" />
                  <p className="text-[0.72rem] text-[var(--color-fg-muted)]">
                    Verified via CGS blockchain-pinned certificate registry
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href="/courses" className="flex-1 btn btn-outline justify-center">
                  <BookOpen size={14} /> Browse Courses
                </Link>
                <Link href="/login" className="flex-1 btn btn-brand justify-center">
                  Get Certified <ExternalLink size={14} />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Invalid / error */}
          {!loading && (error || !result?.valid) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-5"
            >
              <div className="rounded-2xl p-5 flex items-center gap-4 border"
                style={{
                  background: "rgba(220,38,38,0.08)",
                  borderColor: "rgba(220,38,38,0.25)",
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(220,38,38,0.12)" }}>
                  <XCircle size={24} className="text-[var(--color-rose)]" />
                </div>
                <div>
                  <p className="font-display font-black text-lg text-[var(--color-rose)]">Not verified</p>
                  <p className="text-[0.78rem] text-[var(--color-fg-muted)] mt-0.5">
                    {error ?? "This certificate number does not exist in our records."}
                  </p>
                </div>
              </div>

              <div className="card p-5 space-y-3">
                <p className="font-semibold text-[0.9rem] text-[var(--color-fg)]">What this means</p>
                <ul className="space-y-2 text-[0.82rem] text-[var(--color-fg-muted)]">
                  {[
                    "The certificate number may have been entered incorrectly.",
                    "The certificate may have been revoked.",
                    "This certificate was not issued by CG School of Technology.",
                  ].map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--color-rose)] mt-0.5 shrink-0">•</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cert number checked */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <Hash size={12} className="text-[var(--color-fg-subtle)] shrink-0" />
                <span className="font-mono text-[0.72rem] text-[var(--color-fg-muted)]">{certNumber}</span>
              </div>

              <Link href="/" className="btn btn-outline w-full justify-center">
                <ArrowLeft size={14} /> Go to Homepage
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer note */}
      <footer className="py-4 text-center text-[0.72rem] text-[var(--color-fg-subtle)]">
        CG School of Technology · Certificate Verification System
      </footer>
    </div>
  );
}
