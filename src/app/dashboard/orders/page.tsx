"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag, CheckCircle, XCircle, Clock, AlertCircle,
  Loader2, ExternalLink, Receipt, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ordersApi, type OrderRecord, type OrderStatus } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtAmount(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(paise / 100);
}

const STATUS_CONFIG: Record<OrderStatus, {
  label: string; icon: React.ElementType; badgeCls: string;
}> = {
  PENDING:  { label: "Pending",  icon: Clock,         badgeCls: "badge-amber" },
  PAID:     { label: "Paid",     icon: CheckCircle,   badgeCls: "badge-green" },
  FAILED:   { label: "Failed",   icon: XCircle,       badgeCls: "badge-rose"  },
  REFUNDED: { label: "Refunded", icon: Receipt,       badgeCls: "badge-cyan"  },
};

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({ order, index }: { order: OrderRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;
  const hasDiscount = order.discountAmount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="card overflow-hidden"
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--color-surface-2)] transition-colors"
      >
        {/* Status icon */}
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          order.status === "PAID"    ? "bg-[rgba(52,211,153,0.12)]" :
          order.status === "FAILED"  ? "bg-[rgba(251,113,133,0.12)]" :
          order.status === "REFUNDED"? "bg-[var(--color-cyan-dim)]" :
                                       "bg-[rgba(251,191,36,0.12)]"
        )}>
          <Icon size={18} className={
            order.status === "PAID"     ? "text-[var(--color-green)]" :
            order.status === "FAILED"   ? "text-[var(--color-rose)]" :
            order.status === "REFUNDED" ? "text-[var(--color-cyan)]" :
                                          "text-[var(--color-amber)]"
          } />
        </div>

        {/* Course name */}
        <div className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-[0.88rem] text-[var(--color-fg)] truncate">
            {order.course.title}
          </p>
          <p className="text-[0.72rem] text-[var(--color-fg-muted)] mt-0.5">
            {fmtDate(order.createdAt)}
          </p>
        </div>

        {/* Amount + status */}
        <div className="text-right shrink-0 space-y-1">
          <p className="font-display font-bold text-[0.92rem] text-[var(--color-fg)]">
            {fmtAmount(order.finalAmount)}
          </p>
          <span className={cn("badge", cfg.badgeCls)}>{cfg.label}</span>
        </div>

        {/* Chevron */}
        <div className="text-[var(--color-fg-subtle)] ml-2 shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="border-t border-[var(--color-border)] px-4 py-4 bg-[var(--color-surface-2)] space-y-3"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[0.78rem]">
            <div>
              <p className="text-[var(--color-fg-muted)] mb-0.5">Order ID</p>
              <p className="font-mono text-[0.7rem] text-[var(--color-fg)] truncate">{order.id}</p>
            </div>
            <div>
              <p className="text-[var(--color-fg-muted)] mb-0.5">Original Price</p>
              <p className="text-[var(--color-fg)]">{fmtAmount(order.originalAmount)}</p>
            </div>
            {hasDiscount && (
              <div>
                <p className="text-[var(--color-fg-muted)] mb-0.5">Discount</p>
                <p className="text-[var(--color-green)]">− {fmtAmount(order.discountAmount)}</p>
              </div>
            )}
            <div>
              <p className="text-[var(--color-fg-muted)] mb-0.5">Final Amount</p>
              <p className="font-semibold text-[var(--color-fg)]">{fmtAmount(order.finalAmount)}</p>
            </div>
            {order.couponCode && (
              <div>
                <p className="text-[var(--color-fg-muted)] mb-0.5">Coupon Used</p>
                <p className="font-mono text-[var(--color-brand-light)]">{order.couponCode}</p>
              </div>
            )}
            {order.paidAt && (
              <div>
                <p className="text-[var(--color-fg-muted)] mb-0.5">Paid At</p>
                <p className="text-[var(--color-fg)]">{fmtDate(order.paidAt)}</p>
              </div>
            )}
            {order.razorpayPaymentId && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-[var(--color-fg-muted)] mb-0.5">Payment ID</p>
                <p className="font-mono text-[0.7rem] text-[var(--color-fg)]">{order.razorpayPaymentId}</p>
              </div>
            )}
          </div>

          {/* Go to course */}
          {order.status === "PAID" && (
            <Link
              href={`/courses/${order.course.slug}/learn`}
              className="inline-flex items-center gap-2 text-[0.78rem] font-semibold text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors"
            >
              <ExternalLink size={13} /> Open Course
            </Link>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-dim)] flex items-center justify-center">
        <ShoppingBag size={28} className="text-[var(--color-brand)]" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-bold text-lg text-[var(--color-fg)]">No orders yet</h3>
        <p className="text-[0.84rem] text-[var(--color-fg-muted)] max-w-xs">
          Your purchase history will appear here once you enroll in a course.
        </p>
      </div>
      <Link href="/courses" className="btn btn-brand">Explore Courses</Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then(setOrders)
      .catch((e) => setError(e.message ?? "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  // Summary stats
  const totalSpent = orders
    .filter((o) => o.status === "PAID")
    .reduce((s, o) => s + o.finalAmount, 0);
  const paidCount = orders.filter((o) => o.status === "PAID").length;

  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display font-black text-2xl text-[var(--color-fg)]">Order History</h1>
        <p className="text-[0.82rem] text-[var(--color-fg-muted)] mt-0.5">
          All your purchases and payment records.
        </p>
      </motion.div>

      {/* Stats */}
      {!loading && orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {[
            { label: "Total Orders",    value: orders.length,        icon: ShoppingBag,  cls: "text-[var(--color-brand)] bg-[var(--color-brand-dim)]" },
            { label: "Successful",      value: paidCount,            icon: CheckCircle,  cls: "text-[var(--color-green)] bg-[rgba(52,211,153,0.12)]" },
            { label: "Total Invested",  value: fmtAmount(totalSpent),icon: Receipt,      cls: "text-[var(--color-cyan)] bg-[var(--color-cyan-dim)]" },
          ].map(({ label, value, icon: Icon, cls }) => (
            <div key={label} className="card p-3 sm:p-4 flex items-center gap-3">
              <span className={cn("p-2 rounded-lg shrink-0", cls)}>
                <Icon size={15} />
              </span>
              <div>
                <p className="font-display font-black text-lg leading-none text-[var(--color-fg)]">{value}</p>
                <p className="text-[0.68rem] text-[var(--color-fg-muted)] mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filter tabs */}
      {!loading && orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="flex items-center gap-1 bg-[var(--color-surface-2)] rounded-xl p-1 w-fit"
        >
          {(["all", "PAID", "PENDING", "FAILED", "REFUNDED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold capitalize transition-all",
                filter === f
                  ? "bg-[var(--color-brand)] text-white shadow-sm"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              )}
            >
              {f === "all" ? "All" : STATUS_CONFIG[f].label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin text-[var(--color-brand)]" />
          <p className="text-[0.82rem] text-[var(--color-fg-muted)]">Loading orders…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle size={32} className="text-[var(--color-rose)]" />
          <p className="text-[var(--color-fg)] font-semibold">Something went wrong</p>
          <p className="text-[0.82rem] text-[var(--color-fg-muted)]">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-fg-muted)] text-[0.88rem]">No {filter.toLowerCase()} orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o, i) => (
            <OrderRow key={o.id} order={o} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
