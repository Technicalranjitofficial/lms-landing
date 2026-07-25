"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw, MessageSquare, ChevronDown, ChevronUp,
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { proxyApi, formatDate, type SupportTicket } from "@/lib/adminApi";
import { DataTable, type Column } from "@/components/dashboard/DataTable";

// ─── Status config ─────────────────────────────────────────────────────────────
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

const STATUS_BADGE: Record<TicketStatus, string> = {
  OPEN:        "badge-rose",
  IN_PROGRESS: "badge-amber",
  RESOLVED:    "badge-green",
  CLOSED:      "badge-cyan",
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN:        "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED:    "Resolved",
  CLOSED:      "Closed",
};

const STATUS_ICON: Record<TicketStatus, React.ElementType> = {
  OPEN:        AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED:    CheckCircle2,
  CLOSED:      XCircle,
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW:    "badge-cyan",
  MEDIUM: "badge-amber",
  HIGH:   "badge-rose",
  URGENT: "badge-rose",
};

const ALL_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

// ─── Status picker dropdown ────────────────────────────────────────────────────
function StatusPicker({
  current,
  ticketId,
  onUpdate,
}: {
  current:  TicketStatus;
  ticketId: string;
  onUpdate: (id: string, status: TicketStatus) => Promise<void>;
}) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const Icon = STATUS_ICON[current];

  async function select(s: TicketStatus) {
    if (s === current) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      await onUpdate(ticketId, s);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={cn(
          "badge cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center gap-1.5",
          STATUS_BADGE[current]
        )}
      >
        {loading
          ? <Loader2 size={11} className="animate-spin" />
          : <Icon size={11} />}
        {STATUS_LABEL[current]}
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{    opacity: 0, y: 4,  scale: 0.97  }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 z-20 bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-xl shadow-xl overflow-hidden min-w-[140px]"
          >
            {ALL_STATUSES.map((s) => {
              const SIcon = STATUS_ICON[s];
              return (
                <button
                  key={s}
                  onClick={() => select(s)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-[0.78rem] font-medium text-left transition-colors",
                    s === current
                      ? "bg-[var(--color-surface-2)]"
                      : "hover:bg-[var(--color-surface-2)]",
                    s === "OPEN"        && "text-[var(--color-rose)]",
                    s === "IN_PROGRESS" && "text-[var(--color-amber)]",
                    s === "RESOLVED"    && "text-[var(--color-green)]",
                    s === "CLOSED"      && "text-[var(--color-cyan)]",
                  )}
                >
                  <SIcon size={12} />
                  {STATUS_LABEL[s]}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminSupportPage() {
  const [tickets,  setTickets]  = useState<SupportTicket[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState<"ALL" | TicketStatus>("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proxyApi.get<SupportTicket[]>("support/tickets");
      setTickets(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleStatusUpdate(id: string, status: TicketStatus) {
    await proxyApi.put(`support/tickets/${id}/status`, { status });
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  }

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  // ── Summary counts ──────────────────────────────────────────────────────────
  const openCount       = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;

  const columns: Column<SupportTicket>[] = [
    {
      key: "subject",
      header: "Subject",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare size={14} className="text-[var(--color-fg-muted)] shrink-0" />
          <span className="font-medium text-[var(--color-fg)] truncate max-w-[240px]">
            {row.subject}
          </span>
        </div>
      ),
    },
    {
      key: "user" as keyof SupportTicket,
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-fg)] text-[0.82rem]">{row.user.name}</p>
          <p className="text-[0.72rem] text-[var(--color-fg-muted)]">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (row) => (
        <span className={cn("badge", PRIORITY_BADGE[row.priority] ?? "badge-amber")}>
          {row.priority}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <StatusPicker
          current={row.status as TicketStatus}
          ticketId={row.id}
          onUpdate={handleStatusUpdate}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (row) => (
        <span className="text-[var(--color-fg-muted)]">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      render: (row) => (
        <span className="text-[var(--color-fg-muted)]">{formatDate(row.updatedAt)}</span>
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
            <div className="w-5 h-5 rounded-md bg-[rgba(251,113,133,0.12)] flex items-center justify-center">
              <MessageSquare size={11} className="text-[var(--color-rose)]" />
            </div>
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--color-rose)]">
              Support
            </span>
          </div>
          <h1 className="font-display font-black text-xl text-[var(--color-fg)] tracking-tight">Support Tickets</h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-0.5">
            {loading
              ? "Loading…"
              : `${openCount} open · ${inProgressCount} in progress · ${tickets.length} total`}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-ghost text-xs py-2 px-3 gap-1.5">
          <RefreshCcw size={13} className={cn(loading && "animate-spin")} />
          Refresh
        </button>
      </motion.div>

      {/* Summary strip */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {ALL_STATUSES.map((s) => {
            const count = tickets.filter((t) => t.status === s).length;
            const Icon = STATUS_ICON[s];
            const color = {
              OPEN:        "text-[var(--color-rose)]",
              IN_PROGRESS: "text-[var(--color-amber)]",
              RESOLVED:    "text-[var(--color-green)]",
              CLOSED:      "text-[var(--color-cyan)]",
            }[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? "ALL" : s)}
                className={cn(
                  "card p-4 text-left transition-colors",
                  filter === s && "border-[var(--color-border-brand)] bg-[var(--color-brand-dim)]"
                )}
              >
                <div className={cn("flex items-center gap-2 mb-1", color)}>
                  <Icon size={14} />
                  <span className="text-[0.72rem] font-semibold uppercase tracking-wide">
                    {STATUS_LABEL[s]}
                  </span>
                </div>
                <p className={cn("font-display font-black text-xl", color)}>{count}</p>
              </button>
            );
          })}
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
              {tab === "ALL" ? tickets.length : tickets.filter((t) => t.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <DataTable<SupportTicket>
          columns={columns}
          data={filtered}
          keyField="id"
          searchKeys={["subject"]}
          pageSize={15}
          loading={loading}
          emptyMessage={
            filter !== "ALL"
              ? `No ${STATUS_LABEL[filter as TicketStatus]?.toLowerCase()} tickets.`
              : "No support tickets yet."
          }
        />
      </motion.div>
    </div>
  );
}
