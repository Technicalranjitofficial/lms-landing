// ─── API Client for CodePath Backend ───

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002/api";

// ─── Types ───

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
  price: number;
  originalPrice?: number;
  currency: string;
  duration: string;
  totalModules: number;
  totalLectures: number;
  totalProjects: number;
  thumbnail?: string;
  previewVideoUrl?: string;
  images: string[];
  instructor: string;
  instructorAvatar?: string;
  instructorBio?: string;
  studentsEnrolled: number;
  averageRating: number;
  totalReviews: number;
  highlights: string[];
  whatYouLearn: string[];
  prerequisites: string[];
  curriculum?: CurriculumModule[];
  featured: boolean;
  order: number;
  tag?: string;
  accentColor?: string;
  gradient?: string;
  createdAt?: string;
}

export interface CurriculumModule {
  title: string;
  lectures: { title: string; duration: string; isFree: boolean }[];
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
    instructor: string;
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
