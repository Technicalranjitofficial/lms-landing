---
inclusion: auto
---

# Architecture & Folder Structure — CodePath LMS

## Architectural Pattern
Full-featured Learning Management System built with Next.js 16 App Router. Dark-themed with light mode support, animation-heavy marketing pages plus functional student/admin dashboards. Uses Bunny Stream for video delivery, Cloudflare R2 for asset storage, Razorpay for payments, Prisma + PostgreSQL for data persistence.

## Top-Level Layout

```
lms-landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, providers, meta)
│   │   ├── page.tsx                      # Homepage (marketing landing)
│   │   ├── globals.css                   # Global styles, design tokens, utility classes
│   │   │
│   │   ├── (marketing)/                  # Marketing pages (public)
│   │   │   ├── about/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   └── contact/page.tsx
│   │   │
│   │   ├── courses/                      # Course catalog (public)
│   │   │   ├── page.tsx                  # All courses listing with filters
│   │   │   └── [slug]/                   # Individual course detail
│   │   │       ├── page.tsx              # Course overview, syllabus, reviews
│   │   │       └── checkout/page.tsx     # Razorpay checkout for this course
│   │   │
│   │   ├── (auth)/                       # Authentication routes
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   │
│   │   ├── dashboard/                    # Student dashboard (protected)
│   │   │   ├── layout.tsx                # Dashboard shell (sidebar + topbar)
│   │   │   ├── page.tsx                  # Overview: enrolled courses, progress
│   │   │   ├── courses/                  # My enrolled courses
│   │   │   │   ├── page.tsx              # List of enrolled courses
│   │   │   │   └── [courseId]/           # Course learning view
│   │   │   │       ├── page.tsx          # Course curriculum with video player
│   │   │   │       ├── [lessonId]/page.tsx  # Individual lesson player
│   │   │   │       └── notes/page.tsx    # Course notes/resources (R2 downloads)
│   │   │   ├── certificates/page.tsx     # Earned certificates
│   │   │   ├── bookmarks/page.tsx        # Bookmarked lessons
│   │   │   ├── progress/page.tsx         # Detailed progress analytics
│   │   │   ├── orders/page.tsx           # Purchase history
│   │   │   └── settings/page.tsx         # Profile settings
│   │   │
│   │   ├── admin/                        # Admin panel (protected, role-based)
│   │   │   ├── layout.tsx                # Admin shell
│   │   │   ├── page.tsx                  # Admin overview/analytics
│   │   │   ├── courses/                  # Course management
│   │   │   │   ├── page.tsx              # All courses list
│   │   │   │   ├── new/page.tsx          # Create new course
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx          # Edit course details
│   │   │   │       ├── curriculum/page.tsx  # Manage modules & lessons
│   │   │   │       └── analytics/page.tsx   # Course-specific analytics
│   │   │   ├── students/page.tsx         # Student management
│   │   │   ├── orders/page.tsx           # Order/payment management
│   │   │   ├── coupons/page.tsx          # Coupon/discount management
│   │   │   ├── reviews/page.tsx          # Review moderation
│   │   │   ├── media/page.tsx            # Media library (R2 + Bunny)
│   │   │   └── settings/page.tsx         # Platform settings
│   │   │
│   │   └── api/                          # API routes (Route Handlers)
│   │       ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │       ├── courses/route.ts          # CRUD courses
│   │       ├── courses/[courseId]/
│   │       │   ├── route.ts              # Single course CRUD
│   │       │   ├── enroll/route.ts       # Enrollment logic
│   │       │   └── progress/route.ts     # Track lesson progress
│   │       ├── payments/
│   │       │   ├── create-order/route.ts # Create Razorpay order
│   │       │   ├── verify/route.ts       # Verify payment signature
│   │       │   └── webhook/route.ts      # Razorpay webhook handler
│   │       ├── upload/
│   │       │   ├── video/route.ts        # Upload to Bunny Stream
│   │       │   ├── image/route.ts        # Upload to R2
│   │       │   └── document/route.ts     # Upload PDF/notes to R2
│   │       ├── students/route.ts         # Student management
│   │       ├── reviews/route.ts          # Course reviews
│   │       ├── certificates/route.ts     # Generate certificates
│   │       └── coupons/route.ts          # Coupon validation
│   │
│   ├── components/
│   │   ├── marketing/                    # Landing page components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Stats.tsx
│   │   │   ├── Courses.tsx               # Course showcase (landing)
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Placements.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── course/                       # Course-related UI
│   │   │   ├── CourseCard.tsx            # Reusable course card
│   │   │   ├── CourseGrid.tsx            # Filterable course grid
│   │   │   ├── CourseSyllabus.tsx        # Expandable syllabus accordion
│   │   │   ├── CourseReviews.tsx         # Reviews section
│   │   │   ├── CourseInstructor.tsx      # Instructor info card
│   │   │   ├── CoursePricing.tsx         # Price display + CTA
│   │   │   └── CourseProgress.tsx        # Progress bar for enrolled courses
│   │   │
│   │   ├── player/                       # Video player components
│   │   │   ├── VideoPlayer.tsx           # Bunny Stream player wrapper
│   │   │   ├── LessonSidebar.tsx         # Curriculum sidebar in player view
│   │   │   ├── LessonNotes.tsx           # Notes panel
│   │   │   ├── VideoProgress.tsx         # Progress tracking overlay
│   │   │   └── PlayerControls.tsx        # Custom controls (if needed)
│   │   │
│   │   ├── checkout/                     # Payment components
│   │   │   ├── CheckoutForm.tsx          # Order summary + apply coupon
│   │   │   ├── RazorpayButton.tsx        # Razorpay checkout trigger
│   │   │   ├── PricingCard.tsx           # Pricing display card
│   │   │   ├── CouponInput.tsx           # Coupon code input
│   │   │   └── PaymentSuccess.tsx        # Post-payment confirmation
│   │   │
│   │   ├── dashboard/                    # Student dashboard UI
│   │   │   ├── DashboardSidebar.tsx      # Navigation sidebar
│   │   │   ├── DashboardTopbar.tsx       # Top bar with user menu
│   │   │   ├── EnrolledCourseCard.tsx    # Course card with progress
│   │   │   ├── ProgressChart.tsx         # Visual progress charts
│   │   │   ├── ActivityFeed.tsx          # Recent activity
│   │   │   └── CertificateCard.tsx       # Certificate display
│   │   │
│   │   ├── admin/                        # Admin panel UI
│   │   │   ├── AdminSidebar.tsx          # Admin navigation
│   │   │   ├── AdminTopbar.tsx           # Admin top bar
│   │   │   ├── StatsCard.tsx             # Analytics stat card
│   │   │   ├── DataTable.tsx             # Reusable data table
│   │   │   ├── CourseForm.tsx            # Course create/edit form
│   │   │   ├── CurriculumEditor.tsx      # Drag-drop curriculum builder
│   │   │   ├── MediaUploader.tsx         # File upload (R2 + Bunny)
│   │   │   └── OrdersTable.tsx           # Orders list
│   │   │
│   │   └── ui/                           # Shared UI primitives
│   │       ├── Button.tsx                # Button variants
│   │       ├── Input.tsx                 # Form input
│   │       ├── Select.tsx                # Select dropdown
│   │       ├── Modal.tsx                 # Modal/dialog
│   │       ├── Toast.tsx                 # Toast notifications
│   │       ├── Skeleton.tsx              # Loading skeletons
│   │       ├── Avatar.tsx                # User avatar
│   │       ├── Badge.tsx                 # Status badges
│   │       ├── Tabs.tsx                  # Tab navigation
│   │       ├── Accordion.tsx             # Expandable accordion
│   │       ├── Pagination.tsx            # Paginated lists
│   │       ├── StarRating.tsx            # Star rating display/input
│   │       ├── FileUpload.tsx            # Drag-drop file upload
│   │       ├── SearchInput.tsx           # Search with debounce
│   │       └── ThemeToggle.tsx           # Dark/light mode toggle
│   │
│   ├── lib/                              # Utilities & services
│   │   ├── utils.ts                      # cn() utility, formatters
│   │   ├── auth.ts                       # NextAuth configuration
│   │   ├── db.ts                         # Prisma client singleton
│   │   ├── bunny.ts                      # Bunny Stream API client
│   │   ├── r2.ts                         # Cloudflare R2 client (S3-compatible)
│   │   ├── razorpay.ts                   # Razorpay client & helpers
│   │   ├── validations.ts               # Zod schemas for forms & API
│   │   ├── constants.ts                  # App-wide constants
│   │   └── email.ts                      # Email service (Resend/Nodemailer)
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useVideoProgress.ts           # Track video watch progress
│   │   ├── useIntersection.ts            # Intersection observer
│   │   ├── useDebounce.ts                # Debounced values
│   │   ├── useMediaQuery.ts              # Responsive breakpoints
│   │   └── useCourseProgress.ts          # Course completion tracking
│   │
│   ├── types/                            # TypeScript type definitions
│   │   ├── course.ts                     # Course, Module, Lesson types
│   │   ├── user.ts                       # User, Student, Admin types
│   │   ├── payment.ts                    # Order, Transaction types
│   │   ├── review.ts                     # Review types
│   │   └── api.ts                        # API response types
│   │
│   └── middleware.ts                     # Auth middleware (protect routes)
│
├── prisma/
│   ├── schema.prisma                     # Database schema
│   ├── seed.ts                           # Seed data for dev
│   └── migrations/                       # Migration history
│
├── public/                               # Static assets
│   ├── images/                           # Local images
│   ├── icons/                            # Favicons, app icons
│   └── fonts/                            # Self-hosted fonts (if any)
│
├── next.config.ts                        # Standalone output, image domains
├── postcss.config.mjs                    # PostCSS with @tailwindcss/postcss
├── tsconfig.json                         # TypeScript config
├── package.json
├── Dockerfile                            # Multi-stage Docker build
├── .dockerignore
├── .env.local                            # Local env vars (gitignored)
└── .env.example                          # Template for env vars
```

## Route Groups Explained

| Group | Purpose | Auth Required |
|-------|---------|---------------|
| `(marketing)` | Public marketing pages | No |
| `(auth)` | Login, register, password reset | No (redirects if logged in) |
| `courses` | Public course catalog + detail + checkout | No (checkout requires login) |
| `dashboard` | Student learning area | Yes (student role) |
| `admin` | Admin/instructor panel | Yes (admin/instructor role) |
| `api` | Backend route handlers | Varies per endpoint |

## Component Patterns

- All interactive components use `"use client"` directive.
- Server Components used for data fetching (course pages, listings).
- Heavy client components (video player, admin forms) loaded with `dynamic(() => import(...), { ssr: false })`.
- Framer Motion used for scroll animations and hover interactions (marketing pages).
- Dashboard pages are more functional, less animation-heavy.
- Forms use `react-hook-form` + `zod` for validation.

## Data Flow

```
Client (Browser)
  → Next.js Route Handler (API)
    → Prisma (PostgreSQL)
    → Bunny Stream API (videos)
    → Cloudflare R2 (assets)
    → Razorpay API (payments)
  ← JSON Response
```

## Middleware Strategy

```typescript
// src/middleware.ts
// Protects: /dashboard/*, /admin/*
// Redirects unauthenticated users to /login
// Checks role for admin routes
```

## Key Design Decisions

- **Dark + Light theme** — full theme support via `next-themes` and CSS variables.
- **Marketing pages** are animation-heavy (Framer Motion, spotlight cards, parallax).
- **Dashboard/Admin** are functional-first with clean UI (minimal animations).
- **Video playback** uses Bunny Stream iframe embed with token auth for private content.
- **File uploads** go directly to R2 via presigned URLs (large files bypass server).
- **Payments** use Razorpay Checkout.js on client, verified via webhook on server.
- **No client-side state management library** — React Server Components + URL state + React context where needed.
- **Responsive** — mobile-first, breakpoints at `sm:` (640px), `md:` (768px), `lg:` (1024px).
