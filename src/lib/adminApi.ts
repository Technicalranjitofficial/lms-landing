/**
 * adminApi — thin fetch wrapper for admin panel client components.
 *
 * adminApi routes through /api/admin/[...path] (admin-prefixed endpoints).
 * proxyApi routes through /api/proxy/[...path] (non-admin endpoints like
 * orders, coupons, support/tickets).
 *
 * Both proxies inject the session's backend JWT automatically.
 *
 * Usage:
 *   const courses = await adminApi.get<Course[]>("courses");
 *   await adminApi.post("courses", { title: "..." });
 *   await adminApi.put(`courses/${id}`, { status: "PUBLISHED" });
 *   await adminApi.del(`courses/${id}`);
 *
 *   const orders = await proxyApi.get<AdminOrder[]>("orders");
 */

async function request<T>(
  method: string,
  fullPath: string,         // e.g. "/api/admin/courses" or "/api/proxy/orders"
  body?: unknown,
  queryParams?: Record<string, string>
): Promise<T> {
  let url = fullPath;
  if (queryParams) {
    const qs = new URLSearchParams(queryParams).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const adminApi = {
  get:   <T>(path: string, queryParams?: Record<string, string>) =>
           request<T>("GET", `/api/admin/${path}`, undefined, queryParams),
  post:  <T>(path: string, body: unknown) => request<T>("POST", `/api/admin/${path}`, body),
  put:   <T>(path: string, body: unknown) => request<T>("PUT", `/api/admin/${path}`, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", `/api/admin/${path}`, body),
  del:   <T>(path: string) => request<T>("DELETE", `/api/admin/${path}`),
};

/**
 * proxyApi — same as adminApi but routes through /api/proxy/[...path]
 * for backend endpoints not under the /admin prefix
 * (orders, coupons, support/tickets, etc.)
 */
export const proxyApi = {
  get:   <T>(path: string, queryParams?: Record<string, string>) =>
           request<T>("GET", `/api/proxy/${path}`, undefined, queryParams),
  post:  <T>(path: string, body: unknown) => request<T>("POST", `/api/proxy/${path}`, body),
  put:   <T>(path: string, body: unknown) => request<T>("PUT", `/api/proxy/${path}`, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", `/api/proxy/${path}`, body),
  del:   <T>(path: string) => request<T>("DELETE", `/api/proxy/${path}`),
};

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface AdminStats {
  students: number;
  courses: number;
  enrollments: number;
  reviews: number;
  openTickets: number;
  recentEnrollments: RecentEnrollment[];
}

export interface RecentEnrollment {
  id: string;
  enrolledAt: string;
  user:   { name: string; email: string };
  course: { title: string; slug: string };
  order?: { finalAmount: number; status: string } | null;
}

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  category: string;
  level: string;
  price: number;
  originalPrice?: number;
  duration: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  thumbnail?: string;
  instructorId: string;
  tags: string[];
  highlights: string[];
  whatYouLearn: string[];
  prerequisites: string[];
  order: number;
  tag?: string;
  createdAt: string;
  instructor?: { name: string; avatar?: string; instructorTitle?: string };
  _count?: { enrollments: number; reviews: number };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  _count?: { enrollments: number; reviews: number };
}

export interface AdminOrder {
  id: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  couponCode?: string;
  createdAt: string;
  paidAt?: string;
  user:   { name: string; email: string };
  course: { title: string };
}

export interface AdminCoupon {
  id: string;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount: number;
  perUserLimit?: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format paise (₹) to display string, e.g. 499900 → "₹4,999" */
export function formatPrice(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/** Format ISO date to readable string */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}
