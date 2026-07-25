"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Pencil, Trash2, Eye, RefreshCcw, ArrowUpDown, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { adminApi, formatPrice, formatDate, type AdminCourse } from "@/lib/adminApi";
import { DataTable, type Column } from "@/components/dashboard/DataTable";

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "badge-green",
  DRAFT:     "badge-amber",
  ARCHIVED:  "badge-violet",
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Published",
  DRAFT:     "Draft",
  ARCHIVED:  "Archived",
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER:     "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED:     "Advanced",
};

export default function AdminCoursesPage() {
  const [courses,  setCourses]  = useState<AdminCourse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter,   setFilter]   = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.get<AdminCourse[]>("courses");
      setCourses(data);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(course: AdminCourse) {
    if (!confirm(`Archive "${course.title}"? Students retain access.`)) return;
    setDeleting(course.id);
    try {
      await adminApi.del(`courses/${course.id}`);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (e: unknown) {
      alert((e as Error).message ?? "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  async function handleStatusToggle(course: AdminCourse) {
    const next =
      course.status === "PUBLISHED" ? "DRAFT"
      : course.status === "DRAFT"   ? "PUBLISHED"
      : null;
    if (!next) return;
    try {
      await adminApi.put<AdminCourse>(`courses/${course.id}`, { status: next });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, status: next as AdminCourse["status"] } : c))
      );
    } catch (e: unknown) {
      alert((e as Error).message ?? "Status update failed");
    }
  }

  const filtered = filter === "ALL" ? courses : courses.filter((c) => c.status === filter);

  const columns: Column<AdminCourse>[] = [
    {
      key: "title",
      header: "Course",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          {row.thumbnail ? (
            <img
              src={row.thumbnail}
              alt={row.title}
              className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[var(--color-surface-2)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-dim)] shrink-0 flex items-center justify-center text-[var(--color-brand)] font-bold text-sm">
              {row.title[0]}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-fg)] truncate max-w-[220px]">{row.title}</p>
            <p className="text-[0.72rem] text-[var(--color-fg-muted)]">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          title="Click to toggle status"
          className={cn("badge cursor-pointer hover:opacity-80 transition-opacity", STATUS_COLORS[row.status])}
        >
          {STATUS_LABEL[row.status] ?? row.status}
        </button>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-[var(--color-fg)]">{formatPrice(row.price)}</span>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (row) => (
        <span className="text-[var(--color-fg-muted)]">{LEVEL_LABEL[row.level] ?? row.level}</span>
      ),
    },
    {
      key: "_count",
      header: "Enrolled",
      sortable: false,
      render: (row) => (
        <span className="font-medium text-[var(--color-fg)]">
          {row._count?.enrollments?.toLocaleString("en-IN") ?? "—"}
        </span>
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
      key: "id",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/courses/${row.slug}`}
            target="_blank"
            title="View live"
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
          >
            <Eye size={14} />
          </Link>
          <Link
            href={`/admin/courses/${row.id}`}
            title="Edit"
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
          >
            <Pencil size={14} />
          </Link>
          <button
            onClick={() => handleDelete(row)}
            disabled={deleting === row.id}
            title="Archive"
            className="p-1.5 rounded-lg hover:bg-[rgba(251,113,133,0.12)] text-[var(--color-fg-muted)] hover:text-[var(--color-rose)] transition-colors disabled:opacity-40"
          >
            <Trash2 size={14} />
          </button>
        </div>
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
            <div className="w-5 h-5 rounded-md bg-[var(--color-brand-dim)] flex items-center justify-center">
              <BookOpen size={11} className="text-[var(--color-brand-light)]" />
            </div>
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-[var(--color-brand-light)]">
              Content
            </span>
          </div>
          <h1 className="font-display font-black text-xl text-[var(--color-fg)] tracking-tight">Courses</h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-0.5">
            {loading ? "Loading…" : `${courses.length} course${courses.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} className="btn btn-ghost text-xs py-2 px-3 gap-1.5">
            <RefreshCcw size={13} className={cn(loading && "animate-spin")} />
          </button>
          <Link href="/admin/courses/new" className="btn btn-brand">
            <PlusCircle size={15} />
            Add Course
          </Link>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[var(--color-rose)]/30 bg-[var(--color-rose)]/10 px-5 py-3 text-[var(--color-rose)] text-sm">
          {error} — <button onClick={load} className="underline underline-offset-2">retry</button>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[0.78rem] font-semibold border transition-all duration-150",
              filter === tab
                ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-sm shadow-[var(--color-brand-glow)]"
                : "bg-transparent text-[var(--color-fg-muted)] border-[var(--color-border-2)] hover:border-[var(--color-brand)] hover:text-[var(--color-fg)]"
            )}
          >
            {tab === "ALL" ? "All" : STATUS_LABEL[tab]}
            {!loading && (
              <span className={cn("ml-1.5 text-[0.7rem]", filter === tab ? "opacity-80" : "opacity-50")}>
                {tab === "ALL" ? courses.length : courses.filter((c) => c.status === tab).length}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto hidden sm:flex items-center gap-1 text-[0.72rem] text-[var(--color-fg-subtle)]">
          <ArrowUpDown size={11} /> Click status badge to toggle Draft↔Published
        </span>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <DataTable<AdminCourse>
          columns={columns}
          data={filtered}
          keyField="id"
          searchKeys={["title", "category", "level"]}
          pageSize={12}
          loading={loading}
          emptyMessage={
            filter !== "ALL"
              ? `No ${STATUS_LABEL[filter]?.toLowerCase()} courses.`
              : "No courses yet. Add your first course."
          }
        />
      </motion.div>
    </div>
  );
}
