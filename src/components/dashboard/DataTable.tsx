"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key:        keyof T | string;
  header:     string;
  sortable?:  boolean;
  width?:     string;
  render?:    (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns:       Column<T>[];
  data:          T[];
  keyField:      keyof T;
  searchable?:   boolean;
  searchKeys?:   (keyof T)[];
  pageSize?:     number;
  emptyMessage?: string;
  loading?:      boolean;
}

// ─── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-[var(--color-border)]">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-3.5 rounded bg-[var(--color-surface-2)] animate-pulse w-[80%]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  searchable = true,
  searchKeys,
  pageSize = 15,
  emptyMessage = "No records found.",
  loading = false,
}: DataTableProps<T>) {
  const [query,     setQuery]     = useState("");
  const [sortKey,   setSortKey]   = useState<string | null>(null);
  const [sortDir,   setSortDir]   = useState<"asc" | "desc">("asc");
  const [page,      setPage]      = useState(1);

  // ── Search ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim() || !searchable) return data;
    const q = query.toLowerCase();
    const keys = searchKeys ?? (columns.map((c) => c.key) as (keyof T)[]);
    return data.filter((row) =>
      keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, searchable, searchKeys, columns]);

  // ── Sort ────────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Paginate ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearch(q: string) {
    setQuery(q);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      {searchable && (
        <div className="relative max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)] pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search…"
            className="input pl-9 py-2.5 text-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.82rem]">
            <thead>
              <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      "px-5 py-3 text-left font-semibold text-[var(--color-fg-muted)] whitespace-nowrap",
                      col.sortable && "cursor-pointer select-none hover:text-[var(--color-fg)] transition-colors"
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <span className="flex flex-col">
                          <ChevronUp
                            size={10}
                            className={cn(
                              "transition-colors",
                              sortKey === String(col.key) && sortDir === "asc"
                                ? "text-[var(--color-brand)]"
                                : "text-[var(--color-fg-subtle)]"
                            )}
                          />
                          <ChevronDown
                            size={10}
                            className={cn(
                              "-mt-1 transition-colors",
                              sortKey === String(col.key) && sortDir === "desc"
                                ? "text-[var(--color-brand)]"
                                : "text-[var(--color-fg-subtle)]"
                            )}
                          />
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <SkeletonRows cols={columns.length} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-5 py-12 text-center text-[var(--color-fg-muted)] text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr
                    key={String(row[keyField])}
                    className="hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="px-5 py-3.5 text-[var(--color-fg)]"
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[String(col.key) as keyof T] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-between text-[0.8rem] text-[var(--color-fg-muted)]">
            <span>
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                // Show pages around current with ellipsis logic
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-[0.78rem] font-medium transition-colors",
                      currentPage === p
                        ? "bg-[var(--color-brand)] text-white"
                        : "hover:bg-[var(--color-surface-3)] text-[var(--color-fg-muted)]"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
