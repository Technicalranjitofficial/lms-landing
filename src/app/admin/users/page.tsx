"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Mail, Shield, CheckCircle2, XCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi, formatDate, type AdminUser } from "@/lib/adminApi";
import { DataTable, type Column } from "@/components/dashboard/DataTable";

// ─── Role badge colours ────────────────────────────────────────────────────────
const ROLE_BADGE: Record<string, string> = {
  STUDENT:     "badge-cyan",
  INSTRUCTOR:  "badge-violet",
  ADMIN:       "badge-amber",
  SUPER_ADMIN: "badge-rose",
  MENTOR:      "badge-green",
  MARKETING:   "badge-green",
  SUPPORT:     "badge-amber",
  FINANCE:     "badge-amber",
};

// ─── Provider pill ─────────────────────────────────────────────────────────────
function ProviderPill({ provider }: { provider?: string }) {
  const isGoogle = provider?.toUpperCase() === "GOOGLE";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.68rem] font-semibold",
      isGoogle
        ? "bg-[rgba(251,191,36,0.12)] text-[var(--color-amber)] border border-[rgba(251,191,36,0.25)]"
        : "bg-[var(--color-surface-2)] text-[var(--color-fg-muted)] border border-[var(--color-border-2)]"
    )}>
      {isGoogle ? "Google" : "Email"}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.get<AdminUser[]>("users");
      setUsers(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const totalActive   = users.filter((u) => u.isActive).length;
  const totalVerified = users.filter((u) => u.emailVerified).length;

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Student",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={row.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-dim)] shrink-0 flex items-center justify-center text-[var(--color-brand)] font-bold text-xs">
              {row.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-fg)] truncate">{row.name}</p>
            <p className="text-[0.72rem] text-[var(--color-fg-muted)] flex items-center gap-1">
              <Mail size={10} />
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (row) => (
        <span className={cn("badge", ROLE_BADGE[row.role] ?? "badge-cyan")}>
          {row.role.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "emailVerified",
      header: "Verified",
      render: (row) => (
        row.emailVerified
          ? <CheckCircle2 size={15} className="text-[var(--color-green)]" />
          : <XCircle size={15} className="text-[var(--color-rose)]" />
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        <span className={cn("badge", row.isActive ? "badge-green" : "badge-rose")}>
          {row.isActive ? "Active" : "Suspended"}
        </span>
      ),
    },
    {
      key: "provider" as keyof AdminUser,
      header: "Provider",
      render: (row) => <ProviderPill provider={(row as any).provider} />,
    },
    {
      key: "_count" as keyof AdminUser,
      header: "Enrolled",
      render: (row) => (
        <span className="font-medium text-[var(--color-fg)]">
          {row._count?.enrollments ?? 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (row) => (
        <span className="text-[var(--color-fg-muted)]">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "lastLoginAt" as keyof AdminUser,
      header: "Last Login",
      render: (row) => (
        <span className="text-[var(--color-fg-muted)]">
          {row.lastLoginAt ? formatDate(row.lastLoginAt) : "Never"}
        </span>
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
            <div className="w-5 h-5 rounded-md bg-[var(--color-cyan-dim)] flex items-center justify-center">
              <Users size={11} className="text-[var(--color-cyan)]" />
            </div>
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--color-cyan)]">
              Students
            </span>
          </div>
          <h1 className="font-display font-black text-xl text-[var(--color-fg)] tracking-tight">Students</h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-0.5">
            {loading ? "Loading…" : `${users.length} total · ${totalActive} active · ${totalVerified} verified`}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-ghost text-xs py-2 px-3 gap-1.5">
          <RefreshCcw size={13} className={cn(loading && "animate-spin")} />
          Refresh
        </button>
      </motion.div>

      {/* Summary pills */}
      {!loading && users.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="flex flex-wrap gap-3"
        >
          {[
            { label: "Total",     value: users.length,                        color: "bg-[var(--color-surface-2)]" },
            { label: "Active",    value: totalActive,                         color: "bg-[rgba(52,211,153,0.1)]"   },
            { label: "Verified",  value: totalVerified,                       color: "bg-[rgba(34,211,238,0.1)]"   },
            { label: "Google",    value: users.filter((u) => (u as any).provider === "GOOGLE").length, color: "bg-[rgba(251,191,36,0.1)]" },
          ].map((s) => (
            <div
              key={s.label}
              className={cn("px-4 py-2 rounded-xl border border-[var(--color-border-2)] text-sm", s.color)}
            >
              <span className="font-display font-black text-[var(--color-fg)] mr-2">{s.value}</span>
              <span className="text-[var(--color-fg-muted)]">{s.label}</span>
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

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <DataTable<AdminUser>
          columns={columns}
          data={users}
          keyField="id"
          searchKeys={["name", "email"]}
          pageSize={20}
          loading={loading}
          emptyMessage="No students found."
        />
      </motion.div>
    </div>
  );
}
