"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, RefreshCcw, Tag, X, Loader2 } from "lucide-react";import { cn } from "@/lib/utils";
import { proxyApi, formatDate, type AdminCoupon } from "@/lib/adminApi";
import { DataTable, type Column } from "@/components/dashboard/DataTable";

// ─── Create coupon form state ──────────────────────────────────────────────────
interface CouponDraft {
  code:         string;
  description:  string;
  type:         "PERCENTAGE" | "FIXED";
  value:        string;   // raw input — % or ₹
  maxDiscount:  string;
  maxUses:      string;
  validFrom:    string;
  validUntil:   string;
}

const EMPTY: CouponDraft = {
  code:        "",
  description: "",
  type:        "PERCENTAGE",
  value:       "",
  maxDiscount: "",
  maxUses:     "",
  validFrom:   "",
  validUntil:  "",
};

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.8rem] font-semibold text-[var(--color-fg-muted)]">{label}</label>
      {children}
      {hint && <p className="text-[0.72rem] text-[var(--color-fg-subtle)]">{hint}</p>}
    </div>
  );
}

// ─── Create drawer ─────────────────────────────────────────────────────────────
function CreateDrawer({
  open,
  onClose,
  onCreated,
}: {
  open:      boolean;
  onClose:   () => void;
  onCreated: (coupon: AdminCoupon) => void;
}) {
  const [draft,   setDraft]   = useState<CouponDraft>(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [apiErr,  setApiErr]  = useState<string | null>(null);

  function set<K extends keyof CouponDraft>(key: K, val: CouponDraft[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.code.trim() || !draft.value) return;
    setSaving(true);
    setApiErr(null);
    try {
      const payload: Record<string, unknown> = {
        code:        draft.code.trim().toUpperCase(),
        description: draft.description.trim() || undefined,
        type:        draft.type,
        // PERCENTAGE: value is %, FIXED: value is ₹ → convert to paise
        value: draft.type === "PERCENTAGE"
          ? parseInt(draft.value, 10)
          : Math.round(parseFloat(draft.value) * 100),
        ...(draft.maxDiscount && draft.type === "PERCENTAGE"
          ? { maxDiscount: Math.round(parseFloat(draft.maxDiscount) * 100) }
          : {}),
        ...(draft.maxUses    ? { maxUses:    parseInt(draft.maxUses, 10)   } : {}),
        ...(draft.validFrom  ? { validFrom:  draft.validFrom               } : {}),
        ...(draft.validUntil ? { validUntil: draft.validUntil              } : {}),
      };

      const created = await proxyApi.post<AdminCoupon>("coupons", payload);
      onCreated(created);
      setDraft(EMPTY);
      onClose();
    } catch (err: unknown) {
      setApiErr((err as Error).message ?? "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-[var(--color-surface)] border-l border-[var(--color-border)] z-50 overflow-y-auto"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="font-display font-bold text-base text-[var(--color-fg)] flex items-center gap-2">
                <Tag size={16} className="text-[var(--color-brand)]" />
                New Coupon
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] transition-colors"
              >
                <X size={16} className="text-[var(--color-fg-muted)]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {apiErr && (
                <div className="rounded-xl border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/10 px-4 py-2.5 text-[var(--color-rose)] text-sm">
                  {apiErr}
                </div>
              )}

              <Field label="Code *">
                <input
                  required
                  value={draft.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  placeholder="SUMMER25"
                  className="input font-mono uppercase"
                />
              </Field>

              <Field label="Description">
                <input
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Summer sale discount"
                  className="input"
                />
              </Field>

              <Field label="Discount Type">
                <div className="flex gap-2">
                  {(["PERCENTAGE", "FIXED"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("type", t)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl border text-[0.82rem] font-semibold transition-colors",
                        draft.type === t
                          ? "bg-[var(--color-brand-dim)] border-[var(--color-border-brand)] text-[var(--color-brand-light)]"
                          : "border-[var(--color-border-2)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-brand)]"
                      )}
                    >
                      {t === "PERCENTAGE" ? "% Off" : "₹ Fixed"}
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label={draft.type === "PERCENTAGE" ? "Discount %" : "Discount Amount (₹)"}
                hint={draft.type === "PERCENTAGE" ? "Enter 1–100" : "Enter in rupees"}
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)] text-sm font-semibold">
                    {draft.type === "PERCENTAGE" ? "%" : "₹"}
                  </span>
                  <input
                    required
                    type="number"
                    min="1"
                    max={draft.type === "PERCENTAGE" ? "100" : undefined}
                    value={draft.value}
                    onChange={(e) => set("value", e.target.value)}
                    placeholder={draft.type === "PERCENTAGE" ? "25" : "500"}
                    className="input pl-7"
                  />
                </div>
              </Field>

              {draft.type === "PERCENTAGE" && (
                <Field label="Max Discount Cap (₹)" hint="Optional — caps total discount">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)] text-sm">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={draft.maxDiscount}
                      onChange={(e) => set("maxDiscount", e.target.value)}
                      placeholder="2000"
                      className="input pl-7"
                    />
                  </div>
                </Field>
              )}

              <Field label="Max Total Uses" hint="Leave empty for unlimited">
                <input
                  type="number"
                  min="1"
                  value={draft.maxUses}
                  onChange={(e) => set("maxUses", e.target.value)}
                  placeholder="100"
                  className="input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Valid From">
                  <input
                    type="date"
                    value={draft.validFrom}
                    onChange={(e) => set("validFrom", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Valid Until">
                  <input
                    type="date"
                    value={draft.validUntil}
                    onChange={(e) => set("validUntil", e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-brand w-full justify-center"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Creating…" : "Create Coupon"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminCouponsPage() {
  const [coupons,  setCoupons]  = useState<AdminCoupon[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [drawerOpen, setDrawer] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proxyApi.get<AdminCoupon[]>("coupons");
      setCoupons(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(coupon: AdminCoupon) {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    setDeleting(coupon.id);
    try {
      await proxyApi.del(`coupons/${coupon.id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    } catch (e: unknown) {
      alert((e as Error).message ?? "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function handleCreated(coupon: AdminCoupon) {
    setCoupons((prev) => [coupon, ...prev]);
  }

  const columns: Column<AdminCoupon>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[var(--color-brand-light)] text-sm bg-[var(--color-brand-dim)] px-2 py-0.5 rounded-md">
          {row.code}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row) => (
        <span className="text-[var(--color-fg-muted)] text-[0.82rem]">
          {row.description ?? "—"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span className={cn("badge", row.type === "PERCENTAGE" ? "badge-cyan" : "badge-green")}>
          {row.type === "PERCENTAGE" ? "%" : "₹"} {row.type === "PERCENTAGE" ? `${row.value}% off` : `₹${(row.value / 100).toFixed(0)} off`}
        </span>
      ),
    },
    {
      key: "usedCount",
      header: "Used / Max",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-fg)]">{row.usedCount}</span>
          <span className="text-[var(--color-fg-subtle)]">/</span>
          <span className="text-[var(--color-fg-muted)]">{row.maxUses ?? "∞"}</span>
          {row.maxUses && row.usedCount >= row.maxUses && (
            <span className="badge badge-rose text-[0.68rem]">Exhausted</span>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Active",
      render: (row) => (
        <span className={cn("badge", row.isActive ? "badge-green" : "badge-rose")}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "validUntil",
      header: "Expires",
      sortable: true,
      render: (row) => (
        <span className="text-[var(--color-fg-muted)]">
          {row.validUntil ? formatDate(row.validUntil) : "Never"}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      render: (row) => (
        <button
          onClick={() => handleDelete(row)}
          disabled={deleting === row.id}
          className="p-1.5 rounded-lg hover:bg-[rgba(251,113,133,0.12)] text-[var(--color-fg-muted)] hover:text-[var(--color-rose)] transition-colors disabled:opacity-40"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-[rgba(251,191,36,0.12)] flex items-center justify-center">
              <Tag size={11} className="text-[var(--color-amber)]" />
            </div>
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--color-amber)]">
              Promotions
            </span>
          </div>
          <h1 className="font-display font-black text-xl text-[var(--color-fg)] tracking-tight">Coupons</h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-0.5">
            {loading ? "Loading…" : `${coupons.length} coupon${coupons.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} className="btn btn-ghost text-xs py-2 px-3 gap-1.5">
            <RefreshCcw size={13} className={cn(loading && "animate-spin")} />
          </button>
          <button onClick={() => setDrawer(true)} className="btn btn-brand">
            <PlusCircle size={15} />
            New Coupon
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/10 px-5 py-3 text-[var(--color-rose)] text-sm">
          {error} — <button onClick={load} className="underline underline-offset-2">retry</button>
        </div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <DataTable<AdminCoupon>
          columns={columns}
          data={coupons}
          keyField="id"
          searchKeys={["code", "description"]}
          pageSize={15}
          loading={loading}
          emptyMessage="No coupons yet. Create one to get started."
        />
      </motion.div>

      {/* Create drawer */}
      <CreateDrawer
        open={drawerOpen}
        onClose={() => setDrawer(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
