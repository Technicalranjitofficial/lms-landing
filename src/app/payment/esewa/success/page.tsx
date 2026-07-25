"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, BookOpen, ArrowRight } from "lucide-react";

function SuccessContent() {
  const params     = useSearchParams();
  const router     = useRouter();
  const orderId    = params.get("orderId") ?? "";
  const courseSlug = params.get("courseSlug") ?? "";
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect to the course learn page after 5 s
  useEffect(() => {
    if (!courseSlug) return;
    const iv = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(iv);
          router.replace(`/courses/${courseSlug}/learn`);
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [courseSlug, router]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="card max-w-md w-full p-8 text-center space-y-6"
      >
        {/* Animated checkmark */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(52,211,153,0.12)", border: "2px solid rgba(52,211,153,0.35)" }}>
            <CheckCircle size={40} className="text-[var(--color-green)]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-black text-2xl text-[var(--color-fg)]">
            Payment Successful! 🎉
          </h1>
          <p className="text-[0.88rem] text-[var(--color-fg-muted)] leading-relaxed">
            Your eSewa payment was verified. You're now enrolled in the course.
          </p>
          {orderId && (
            <p className="font-mono text-[0.72rem] text-[var(--color-fg-subtle)]">
              Order: {orderId}
            </p>
          )}
        </div>

        {courseSlug ? (
          <div className="space-y-3">
            <p className="text-[0.78rem] text-[var(--color-fg-muted)]">
              Redirecting to your course in{" "}
              <span className="font-bold text-[var(--color-brand)]">{countdown}s</span>…
            </p>
            <Link
              href={`/courses/${courseSlug}/learn`}
              className="btn btn-brand w-full justify-center"
            >
              <BookOpen size={15} /> Start Learning Now <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <Link href="/dashboard/courses" className="btn btn-brand w-full justify-center">
            <BookOpen size={15} /> Go to My Courses
          </Link>
        )}

        <Link
          href="/dashboard/orders"
          className="block text-[0.76rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
        >
          View order history →
        </Link>
      </motion.div>
    </div>
  );
}

export default function EsewaSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
