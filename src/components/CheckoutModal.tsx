"use client";

/**
 * CheckoutModal
 * ─────────────
 * Gateway picker + payment initiation for course enrollment.
 *
 * Flow A — Razorpay (INR):
 *   1. POST /orders → { razorpayOrderId, razorpayKeyId, amount }
 *   2. Open Razorpay Checkout SDK modal
 *   3. On success → POST /orders/verify → enrollment activated
 *
 * Flow B — eSewa (NPR):
 *   1. POST /orders → { esewaFormData, esewaPayUrl }
 *   2. Auto-submit a hidden HTML form → redirect to eSewa
 *   3. eSewa redirects to GET /api/orders/esewa/success (backend)
 *   4. Backend verifies → redirects to /payment/esewa/success
 *
 * Usage:
 *   <CheckoutModal
 *     course={course}
 *     open={checkoutOpen}
 *     onClose={() => setCheckoutOpen(false)}
 *     onEnrolled={() => router.push(`/courses/${course.slug}/learn`)}
 *   />
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Shield, Loader2, CheckCircle, AlertCircle,
  Tag, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Gateway = "RAZORPAY" | "ESEWA";

interface Props {
  course:     Course;
  open:       boolean;
  onClose:    () => void;
  onEnrolled: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtINR(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

function fmtNPR(paise: number) {
  // Treat the same paise value as Nepali paisa → rupees
  return `Rs. ${Math.round(paise / 100).toLocaleString("ne-NP")}`;
}

// Load Razorpay SDK once
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const s  = document.createElement("script");
    s.src    = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror= () => resolve(false);
    document.body.appendChild(s);
  });
}

// ─── Gateway Option Card ──────────────────────────────────────────────────────

function GatewayCard({
  id, label, desc, logo, selected, onClick,
}: {
  id: Gateway; label: string; desc: string; logo: React.ReactNode;
  selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
        selected
          ? "border-[var(--color-border-brand)] bg-[var(--color-brand-dim)]"
          : "border-[var(--color-border)] hover:border-[var(--color-border-2)] bg-[var(--color-surface-2)]"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
        {logo}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[0.9rem] text-[var(--color-fg)]">{label}</p>
        <p className="text-[0.74rem] text-[var(--color-fg-muted)] mt-0.5">{desc}</p>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
        selected
          ? "border-[var(--color-brand)] bg-[var(--color-brand)]"
          : "border-[var(--color-fg-subtle)]"
      )}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

// ─── Hidden eSewa form ────────────────────────────────────────────────────────

function EsewaAutoForm({ data, action }: {
  data: Record<string, string>; action: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    // Submit automatically on mount
    formRef.current?.submit();
  }, []);
  return (
    <form ref={formRef} method="POST" action={action} style={{ display: "none" }}>
      {Object.entries(data).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
    </form>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function CheckoutModal({ course, open, onClose, onEnrolled }: Props) {
  const [gateway,     setGateway]     = useState<Gateway>("RAZORPAY");
  const [couponCode,  setCouponCode]  = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [esewaForm,   setEsewaForm]   = useState<{ data: Record<string,string>; action: string } | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  // Reset on re-open
  useEffect(() => {
    if (open) {
      setError(null);
      setEsewaForm(null);
      setLoading(false);
    }
  }, [open]);

  async function handlePay() {
    setError(null);
    setLoading(true);

    try {
      // Create order on backend
      const res = await fetch("/api/student/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId:   course.id,
          gateway,
          couponCode: couponCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Order creation failed");

      // FREE order (100% coupon)
      if (data.gateway === "FREE") {
        onEnrolled();
        onClose();
        return;
      }

      // ── Razorpay ──────────────────────────────────────────────────────────
      if (data.gateway === "RAZORPAY") {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error("Could not load Razorpay. Check your connection.");

        await new Promise<void>((resolve, reject) => {
          const rzp = new (window as any).Razorpay({
            key:         data.razorpayKeyId,
            amount:      data.amount,
            currency:    data.currency ?? "INR",
            order_id:    data.razorpayOrderId,
            name:        "CG School of Technology",
            description: course.title,
            image:       course.thumbnail,
            prefill:     {},
            theme:       { color: "#7c6fff" },
            handler: async (response: any) => {
              // Verify on backend
              const vRes = await fetch("/api/student/orders/verify", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId:           data.order.id,
                  razorpayOrderId:   response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const vData = await vRes.json();
              if (!vRes.ok) {
                reject(new Error(vData.error ?? vData.message ?? "Verification failed"));
              } else {
                resolve();
              }
            },
            modal: {
              ondismiss: () => reject(new Error("__dismissed__")),
            },
          });
          rzp.open();
        });

        onEnrolled();
        onClose();
        return;
      }

      // ── eSewa ─────────────────────────────────────────────────────────────
      if (data.gateway === "ESEWA") {
        // Render the hidden form → auto-submits → page navigates to eSewa
        setEsewaForm({ data: data.esewaFormData, action: data.esewaPayUrl });
        return; // don't setLoading(false) — page will navigate away
      }

    } catch (e: unknown) {
      const msg = (e instanceof Error) ? e.message : "Payment failed";
      if (msg === "__dismissed__") {
        setError("Payment cancelled.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  const displayPrice = gateway === "ESEWA"
    ? fmtNPR(course.price)
    : fmtINR(course.price);

  const originalDisplay = course.originalPrice
    ? (gateway === "ESEWA" ? fmtNPR(course.originalPrice) : fmtINR(course.originalPrice))
    : null;

  const discount = course.originalPrice && course.originalPrice > course.price
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : 0;

  return (
    <>
      {/* eSewa auto-submit form — renders invisibly, submits on mount */}
      {esewaForm && (
        <EsewaAutoForm data={esewaForm.data} action={esewaForm.action} />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] w-full max-w-md overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                <div>
                  <h2 className="font-display font-bold text-[1rem] text-[var(--color-fg)]">
                    Complete Enrollment
                  </h2>
                  <p className="text-[0.72rem] text-[var(--color-fg-muted)] mt-0.5 line-clamp-1">
                    {course.title}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Price summary */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <div>
                    <p className="text-[0.72rem] text-[var(--color-fg-muted)]">Course fee</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-display font-black text-xl text-[var(--color-fg)]">
                        {displayPrice}
                      </span>
                      {originalDisplay && (
                        <span className="text-[0.72rem] text-[var(--color-fg-subtle)] line-through">
                          {originalDisplay}
                        </span>
                      )}
                    </div>
                  </div>
                  {discount > 0 && (
                    <span className="badge badge-green text-[0.68rem]">{discount}% off</span>
                  )}
                </div>

                {/* Gateway selector */}
                <div className="space-y-2">
                  <p className="text-[0.76rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider">
                    Choose payment method
                  </p>
                  <GatewayCard
                    id="RAZORPAY"
                    label="Razorpay"
                    desc="Card · UPI · Net banking · Wallet (INR)"
                    selected={gateway === "RAZORPAY"}
                    onClick={() => setGateway("RAZORPAY")}
                    logo={
                      <svg viewBox="0 0 40 40" width="28" height="28">
                        <rect width="40" height="40" rx="8" fill="#072654" />
                        <text x="5" y="28" fontSize="14" fill="#00BAF2" fontWeight="bold" fontFamily="Arial">Rzp</text>
                      </svg>
                    }
                  />
                  <GatewayCard
                    id="ESEWA"
                    label="eSewa"
                    desc="eSewa wallet (NPR — Nepal only)"
                    selected={gateway === "ESEWA"}
                    onClick={() => setGateway("ESEWA")}
                    logo={
                      <svg viewBox="0 0 40 40" width="28" height="28">
                        <rect width="40" height="40" rx="8" fill="#60BB46" />
                        <text x="4" y="28" fontSize="11" fill="white" fontWeight="bold" fontFamily="Arial">eSewa</text>
                      </svg>
                    }
                  />
                </div>

                {/* Coupon */}
                <div className="space-y-1.5">
                  <p className="text-[0.76rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider">
                    Coupon code (optional)
                  </p>
                  <div className="relative">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="LAUNCH50"
                      className="input pl-9 py-2.5 text-[0.84rem] uppercase tracking-widest"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-[rgba(251,113,133,0.3)] bg-[rgba(251,113,133,0.08)]">
                    <AlertCircle size={14} className="text-[var(--color-rose)] shrink-0" />
                    <p className="text-[0.78rem] text-[var(--color-rose)]">{error}</p>
                  </div>
                )}

                {/* Pay button */}
                <button
                  onClick={handlePay}
                  disabled={loading || !!esewaForm}
                  className="btn btn-brand w-full justify-center py-3 text-[0.88rem] disabled:opacity-60"
                >
                  {loading || esewaForm ? (
                    <><Loader2 size={16} className="animate-spin" /> Redirecting…</>
                  ) : (
                    <><CreditCard size={16} /> Pay {displayPrice} <ChevronRight size={14} /></>
                  )}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <span className="flex items-center gap-1 text-[0.68rem] text-[var(--color-fg-subtle)]">
                    <Shield size={11} className="text-[var(--color-green)]" />
                    Secure payment
                  </span>
                  <span className="flex items-center gap-1 text-[0.68rem] text-[var(--color-fg-subtle)]">
                    <CheckCircle size={11} className="text-[var(--color-green)]" />
                    Instant enrollment
                  </span>
                  <span className="flex items-center gap-1 text-[0.68rem] text-[var(--color-fg-subtle)]">
                    <CheckCircle size={11} className="text-[var(--color-green)]" />
                    Lifetime access
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
