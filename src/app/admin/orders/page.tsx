"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, IndianRupee, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { proxyApi, formatPrice, formatDate, type AdminOrder } from "@/lib/adminApi";
import { DataTable, type Column } from "@/components/dashboard/DataTable";

// ─── Status config ─────────────────────────────────────────────────────────────
type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

const STATUS_BADGE: Record<OrderStatus, string> = {
  PAID:     "badge-green",
  PENDING:  "badge-amber",
  FAILED:   "badge-rose",
  REFUNDED: "badge-violet",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PAID:     "Paid",
  PENDING:  "Pending",
  FAILED:   "Failed",
  REFUNDED: "Refunded",
};

const ALL_STATUSES: OrderStatus[] = ["PAID", "PENDING", "FAILED", "REFUNDED"];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<"ALL" | OrderStatus>("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proxyApi.get<AdminOrder[]>("orders");
      setOrders(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  // ── Revenue totals ─────────────────────────────────────────────────────────
  const paidOrders   = orders.filter((o) => o.status === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.finalAmount, 0);

  const columns: Column<AdminOrder>[] = [
    {
      key: "id",
      header: "Order ID",
      render: (row) => (
        <span className="font-mono text-[0.74rem] text-[var(--color-fg-muted)]">
          {row.id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "user" as keyof AdminOrder,
      header: "Student",
      sortable: false,
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-fg)]">{row.user.name}</p>
          <p className="text-[0.72rem] text-[var(--color-fg-muted)]">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: "course" as keyof AdminOrder,
      header: "Course",
      render: (row) => (
        <span className="text-[var(--color-fg-muted)] max-w-[180px] truncate block">
          {row.course.title}
        </span>
      ),
    },
    {
      key: "finalAmount",
      header: "Amount",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-[var(--color-fg)]">{formatPrice(row.finalAmount)}</span>
          {row.discountAmount > 0 && (
            <span className="ml-2 text-[0.72rem] text-[var(--color-green)]">
              −{formatPrice(row.discountAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "couponCode" as keyof AdminOrder,
      header: "Coupon",
      render: (row) => (
        row.couponCode
          ? <span className="font-mono text-[0.74rem] badge badge-violet">{row.couponCode}</span>
          : <span className="text-[var(--color-fg-subtle)]">—</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <span className={cn("badge", STATUS_BADGE[row.status as OrderStatus] ?? "badge-amber")}>
          {STATUS_LABEL[row.status as OrderStatus] ?? row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-[var(--color-fg-muted)]">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-[rgba(52,211,153,0.12)] flex items-center justify-center">
              <ShoppingBag size={11} className="text-[var(--color-green)]" />
            </div>
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--color-green)]">
              Transactions
            </span>
          </div>
          <h1 className="font-display font-black text-xl text-[var(--color-fg)] tracking-tight">Orders</h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-0.5">
            {loading ? "Loading…" : `${orders.length} orders · ${paidOrders.length} paid`}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-ghost text-xs py-2 px-3 gap-1.5">
          <RefreshCcw size={13} className={cn(loading && "animate-spin")} />
          Refresh
        </button>
      </motion.div>

      {/* Revenue summary */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Revenue",  value: formatPrice(totalRevenue),              color: "text-[var(--color-green)]"  },
            { label: "Paid Orders",    value: paidOrders.length.toString(),            color: "text-[var(--color-fg)]"    },
            { label: "Pending",        value: orders.filter((o) => o.status === "PENDING").length.toString(),  color: "text-[var(--color-amber)]"  },
            { label: "Refunded",       value: orders.filter((o) => o.status === "REFUNDED").length.toString(), color: "text-[var(--color-violet)]" },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[var(--color-fg-muted)] text-[0.74rem]">
                <IndianRupee size={11} />
                {s.label}
              </div>
              <p className={cn("font-display font-black text-xl tracking-tight", s.color)}>
                {s.value}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/10 px-5 py-3 text-[var(--color-rose)] text-sm">
          {error} — <button onClick={load} className="underline underline-offset-2">retry</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["ALL", ...ALL_STATUSES] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[0.78rem] font-semibold border transition-colors",
              filter === tab
                ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                : "bg-transparent text-[var(--color-fg-muted)] border-[var(--color-border-2)] hover:border-[var(--color-brand)] hover:text-[var(--color-fg)]"
            )}
          >
            {tab === "ALL" ? "All" : STATUS_LABEL[tab]}
            <span className="ml-1.5 text-[0.7rem] opacity-70">
              {tab === "ALL"
                ? orders.length
                : orders.filter((o) => o.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <DataTable<AdminOrder>
          columns={columns}
          data={filtered}
          keyField="id"
          searchKeys={["id"]}
          pageSize={20}
          loading={loading}
          emptyMessage={
            filter !== "ALL"
              ? `No ${STATUS_LABEL[filter as OrderStatus]?.toLowerCase()} orders.`
              : "No orders yet."
          }
        />
      </motion.div>
    </div>
  );
}
