"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled:          "You cancelled the payment.",
  signature_mismatch: "Payment verification failed. Please contact support.",
  order_not_found:    "Order not found. Please try again.",
  invalid_response:   "Invalid response from eSewa. Please try again.",
  NOT_FOUND:          "Payment session expired. Please try again.",
  AMBIGUOUS:          "Payment is in an ambiguous state. Contact support.",
  verify_failed:      "Could not verify payment with eSewa. Contact support.",
};

function FailureContent() {
  const params = useSearchParams();
  const error  = params.get("error") ?? "cancelled";
  const msg    = ERROR_MESSAGES[error] ?? `Payment failed (${error}). Please try again.`;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 0.45 }}
        className="card max-w-md w-full p-8 text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(251,113,133,0.1)", border: "2px solid rgba(251,113,133,0.3)" }}>
            <XCircle size={40} className="text-[var(--color-rose)]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-black text-2xl text-[var(--color-fg)]">
            Payment Failed
          </h1>
          <p className="text-[0.88rem] text-[var(--color-fg-muted)] leading-relaxed">{msg}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/courses" className="btn btn-brand w-full justify-center">
            <RefreshCw size={14} /> Try Again
          </Link>
          <Link href="/" className="btn btn-outline w-full justify-center">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        <p className="text-[0.72rem] text-[var(--color-fg-subtle)]">
          If you were charged, contact{" "}
          <a href="mailto:support@cgschool.in"
            className="text-[var(--color-brand-light)] hover:underline">
            support@cgschool.in
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function EsewaFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}
