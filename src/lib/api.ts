// ─── API Client for CodePath Backend ───

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002/api";

// ─── Types ───

export interface CourseInstructor {
  id?: string;
  name: string;
  avatar?: string;
  instructorTitle?: string;
  instructorBio?: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  position: number;
  duration?: number;
  isFree: boolean;
  videoId?: string;   // present for enrolled students / admin
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  position: number;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  category: string;
  level: string;
  tags: string[];
  /** Price in paise (e.g. 1499900 = ₹14,999) */
  price: number;
  originalPrice?: number;
  currency: string;
  duration: string;
  totalModules: number;
  totalLectures: number;
  totalProjects: number;
  totalHours: number;
  thumbnail?: string;
  previewVideoId?: string;
  images: string[];
  instructor: CourseInstructor;
  studentsEnrolled: number;
  averageRating: number;
  totalReviews: number;
  highlights: string[];
  whatYouLearn: string[];
  prerequisites: string[];
  modules?: CourseModule[];
  featured: boolean;
  order: number;
  tag?: string;
  accentColor?: string;
  gradient?: string;
  createdAt?: string;
}


export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Enrollment {
  id: string;
  courseId: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "REFUNDED";
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    thumbnail?: string;
    duration: string;
    instructor: CourseInstructor;
    totalModules: number;
    totalLectures: number;
  };
}

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  courseId?: string;
  message: string;
}

// ─── API Error ───

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ─── Fetch Wrapper ───

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Attach token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("codepath_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(body.message || `HTTP ${res.status}`, res.status);
  }

  return res.json();
}

// ─── Public Endpoints (no auth required) ───

export const publicApi = {
  /** Get all visible courses */
  getCourses: (params?: {
    category?: string;
    level?: string;
    featured?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.level) query.set("level", params.level);
    if (params?.featured) query.set("featured", params.featured);
    const qs = query.toString();
    return request<Course[]>(`/public/courses${qs ? `?${qs}` : ""}`);
  },

  /** Get single course by slug */
  getCourseBySlug: (slug: string) => {
    return request<Course>(`/public/courses/${slug}`);
  },

  /** Get course reviews */
  getCourseReviews: (slug: string, page = 1, limit = 10) => {
    return request<ReviewsResponse>(
      `/public/courses/${slug}/reviews?page=${page}&limit=${limit}`
    );
  },

  /** Submit contact inquiry */
  submitInquiry: (data: InquiryPayload) => {
    return request<{ message: string }>("/public/inquiries", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── User/Auth Endpoints ───

export const userApi = {
  /** Register a new student */
  register: (data: { name: string; email: string; password: string; phone?: string }) => {
    return request<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Login student */
  login: (data: { email: string; password: string }) => {
    return request<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Get current user profile */
  getProfile: () => {
    return request<User & { _count: { enrollments: number; reviews: number } }>(
      "/users/profile"
    );
  },

  /** Create a review */
  createReview: (data: {
    courseId: string;
    rating: number;
    title?: string;
    comment?: string;
  }) => {
    return request<Review>("/users/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── Enrollment Endpoints ───

export const enrollmentApi = {
  /** Get current user's enrollments */
  getMyEnrollments: () => {
    return request<Enrollment[]>("/enrollments/mine");
  },

  /** Enroll in a course */
  enroll: (data: {
    courseId: string;
    paymentId?: string;
    paymentMethod?: string;
    amountPaid?: number;
  }) => {
    return request<Enrollment>("/enrollments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update progress */
  updateProgress: (enrollmentId: string, progress: number) => {
    return request<Enrollment>(`/enrollments/${enrollmentId}/progress`, {
      method: "PUT",
      body: JSON.stringify({ progress }),
    });
  },

  /** Check enrollment for a course */
  checkEnrollment: (courseId: string) => {
    return request<{ enrolled: boolean; enrollment: Enrollment | null }>(
      `/enrollments/check/${courseId}`
    );
  },
};

// ─── Student Endpoints (authenticated, any role) ──────────────────────────────
// Routes through /api/student/[...path] which injects the session's backendToken.

async function studentRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/student/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers as Record<string, string> ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(body.error ?? body.message ?? `HTTP ${res.status}`, res.status);
  }
  return res.json();
}

export interface EnrollmentRecord {
  id: string;
  courseId: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "REFUNDED";
  progressPercent: number;
  enrolledAt: string;
  lastLessonId?: string;
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    thumbnail?: string;
    duration: string;
    instructor: CourseInstructor;
    totalModules: number;
    totalLectures: number;
  };
}

// ─── Lesson Progress Types ────────────────────────────────────────────────────

export interface LessonProgressRecord {
  lessonId: string;
  watchedSeconds: number;
  completed: boolean;
  completedAt?: string;
}

export interface UpsertProgressPayload {
  lessonId: string;
  enrollmentId: string;
  watchedSeconds: number;
  completed?: boolean;
}

export const studentApi = {
  /** Enroll in a course (no payment required — free enroll for now) */
  enroll: (courseId: string) =>
    studentRequest<EnrollmentRecord>("enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }),

  /** Check if the current user is enrolled in a course */
  checkEnrollment: (courseId: string) =>
    studentRequest<{ enrolled: boolean; enrollment: EnrollmentRecord | null }>(
      `enrollments/check/${courseId}`
    ),

  /** Get all enrollments for the current user */
  getMyEnrollments: () =>
    studentRequest<EnrollmentRecord[]>("enrollments/mine"),
};

// ─── Lesson Progress Endpoints ────────────────────────────────────────────────

export const lessonProgressApi = {
  /**
   * Upsert progress for a single lesson.
   * Called on debounced timeupdate (~10s) and on video end.
   */
  upsert: (data: UpsertProgressPayload) =>
    studentRequest<LessonProgressRecord>("lesson-progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Fetch all lesson progress records for an enrollment.
   * Used on page mount to restore completed state and watched seconds.
   */
  getByEnrollment: (enrollmentId: string) =>
    studentRequest<LessonProgressRecord[]>(
      `lesson-progress/enrollment/${enrollmentId}`
    ),
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderRecord {
  id: string;
  courseId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  couponCode?: string;
  status: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
  course: {
    title: string;
    slug: string;
    thumbnail?: string;
  };
}

export interface CreateOrderPayload {
  courseId: string;
  couponCode?: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const ordersApi = {
  /** Get student's own order history */
  getMyOrders: () =>
    studentRequest<OrderRecord[]>("orders/mine"),

  /** Initiate a Razorpay checkout order */
  createOrder: (data: CreateOrderPayload) =>
    studentRequest<{
      order: OrderRecord;
      razorpayOrderId: string | null;
      razorpayKeyId: string | null;
    }>("orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Verify Razorpay payment after callback */
  verifyPayment: (data: VerifyPaymentPayload) =>
    studentRequest<{ message: string; enrollment: EnrollmentRecord }>(
      "orders/verify",
      { method: "POST", body: JSON.stringify(data) }
    ),
};

// ─── Certificates ─────────────────────────────────────────────────────────────

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  pdfUrl?: string;
  issuedAt: string;
  course: {
    title: string;
    slug: string;
    thumbnail?: string;
  };
}

export const certificatesApi = {
  /** Get all certificates earned by the current student */
  getMine: () =>
    studentRequest<CertificateRecord[]>("certificates/mine"),

  /** Get a single certificate by id */
  getOne: (id: string) =>
    studentRequest<CertificateRecord>(`certificates/${id}`),
};

// ─── Support Tickets ──────────────────────────────────────────────────────────

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketCategory =
  | "TECHNICAL"
  | "BILLING"
  | "COURSE_CONTENT"
  | "ACCOUNT"
  | "OTHER";

export interface TicketReply {
  id: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
  user: { name: string; avatar?: string };
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
}

export interface ReplyTicketPayload {
  message: string;
}

export const supportApi = {
  /** Get current student's own tickets */
  getMyTickets: () =>
    studentRequest<SupportTicket[]>("support/tickets/mine"),

  /** Get a single ticket with replies */
  getOne: (id: string) =>
    studentRequest<SupportTicket>(`support/tickets/${id}`),

  /** Create a new support ticket */
  createTicket: (data: CreateTicketPayload) =>
    studentRequest<SupportTicket>("support/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Reply to an existing ticket */
  reply: (id: string, data: ReplyTicketPayload) =>
    studentRequest<SupportTicket>(`support/tickets/${id}/reply`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  avatar?: string;
}

export const profileApi = {
  /** Get current user profile */
  get: () =>
    studentRequest<{
      id: string;
      email: string;
      name: string;
      avatar?: string;
      phone?: string;
      role: string;
      provider: string;
      emailVerified: boolean;
      createdAt: string;
      _count: { enrollments: number; reviews: number };
    }>("users/profile"),
};

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export interface BookmarkCourse {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  price: number;
  originalPrice?: number;
  duration: string;
  level: string;
  totalLectures: number;
  studentsEnrolled: number;
  averageRating: number;
  tag?: string;
  accentColor?: string;
  gradient?: string;
  instructor: {
    name: string;
    avatar?: string;
    instructorTitle?: string;
  };
}

export interface BookmarkRecord {
  id: string;
  createdAt: string;
  course: BookmarkCourse;
}

export const bookmarksApi = {
  /** Get all bookmarked courses for the current student */
  getMine: () =>
    studentRequest<BookmarkRecord[]>("bookmarks/mine"),

  /** Check if a specific course is bookmarked */
  check: (courseId: string) =>
    studentRequest<{ bookmarked: boolean }>(`bookmarks/check/${courseId}`),

  /** Toggle bookmark on/off — returns new state */
  toggle: (courseId: string) =>
    studentRequest<{ bookmarked: boolean; courseId?: string; bookmark?: BookmarkRecord }>(
      "bookmarks/toggle",
      { method: "POST", body: JSON.stringify({ courseId }) }
    ),

  /** Explicitly add a bookmark */
  add: (courseId: string) =>
    studentRequest<{ bookmarked: boolean; bookmark: BookmarkRecord }>(
      "bookmarks",
      { method: "POST", body: JSON.stringify({ courseId }) }
    ),

  /** Remove a bookmark */
  remove: (courseId: string) =>
    studentRequest<{ bookmarked: boolean; courseId: string }>(
      `bookmarks/${courseId}`,
      { method: "DELETE" }
    ),
};
