# CodePath LMS — Forward Engineering Spec

> **Document Purpose**: Defines the planned features, implementation phases, technical requirements, and engineering roadmap for taking CodePath from a marketing site to a full LMS platform.
>
> **Last Updated**: July 2026

---

## 1. Vision & Goals

### Product Vision
Transform CodePath from a static marketing site into a fully functional Learning Management System where students can purchase courses, watch video lectures, track progress, and earn certificates — while admins manage content, students, and revenue through a dedicated panel.

### Success Metrics
- Students can discover, purchase, and consume video courses end-to-end
- Payment processing is secure and reliable (Razorpay)
- Video content is protected and streams smoothly (Bunny Stream HLS)
- Admin can create/manage courses without developer intervention
- Platform handles 10,000+ concurrent students without degradation

---

## 2. Phase Breakdown

### Phase 0: Marketing Landing (DONE)
> See [RETRO-SPEC.md](./RETRO-SPEC.md) for full details.

### Phase 1: Foundation & Authentication
### Phase 2: Course Catalog Enhancement
### Phase 3: Payment & Checkout (Razorpay)
### Phase 4: Video Player & Learning Experience (Bunny Stream)
### Phase 5: Student Dashboard
### Phase 6: Admin Panel
### Phase 7: Advanced Features
### Phase 8: Production Hardening

---

## 3. Phase 1 — Foundation & Authentication

### 3.1 Objectives
- Set up database schema with Prisma + PostgreSQL
- Implement user authentication (email/password + Google OAuth)
- Add route protection middleware
- Establish API route handler patterns

### 3.2 New Dependencies
```bash
npm install @prisma/client next-auth @auth/prisma-adapter bcryptjs zod
npm install -D prisma @types/bcryptjs
```

### 3.3 Database Schema (Prisma)

**Key Models:**
- `User` — id, name, email, password (hashed), avatar, role (STUDENT/INSTRUCTOR/ADMIN), emailVerified
- `Course` — id, title, slug, description, price (paise), salePrice, thumbnail, duration, level, status (DRAFT/PUBLISHED/ARCHIVED), featured, category, tags, instructorId
- `Module` — id, title, position, courseId
- `Lesson` — id, title, position, duration, videoId (Bunny), isFree, moduleId
- `Resource` — id, title, type (PDF/CODE/LINK), url (R2), lessonId
- `Enrollment` — id, userId, courseId, orderId, completedAt
- `LessonProgress` — id, enrollmentId, lessonId, watched (seconds), completed
- `Order` — id, userId, courseId, amount, razorpayOrderId, razorpayPaymentId, status (PENDING/PAID/FAILED/REFUNDED)
- `Review` — id, userId, courseId, rating, title, comment, verified
- `Coupon` — id, code, type (PERCENTAGE/FIXED), value, maxUses, usedCount, expiresAt

### 3.4 Authentication Flow

```
Register → bcrypt hash password → Create User → Generate JWT → Set httpOnly cookie
Login → Verify credentials → Generate JWT → Set httpOnly cookie
OAuth (Google) → NextAuth callback → Create/link User → Session
Logout → Clear cookie → Redirect to home
```

### 3.5 Middleware (`src/middleware.ts`)
```
/dashboard/*  → Require authenticated (any role)
/admin/*      → Require role === ADMIN
/api/admin/*  → Require role === ADMIN
/api/users/*  → Require authenticated
/api/enrollments/* → Require authenticated
```

### 3.6 Pages to Build
| Route | Description |
|-------|-------------|
| `/login` | Email/password + Google OAuth login |
| `/register` | Registration form with validation |
| `/forgot-password` | Password reset request |
| `/verify-email` | Email verification handler |

### 3.7 Deliverables
- [ ] Prisma schema with all models + initial migration
- [ ] Seed script with sample courses, admin user, test data
- [ ] NextAuth configuration (Credentials + Google provider)
- [ ] Login/Register pages with react-hook-form + zod validation
- [ ] Middleware for route protection
- [ ] Auth API routes (`/api/auth/[...nextauth]`)
- [ ] Password reset flow (with email via Resend/Nodemailer)

---

## 4. Phase 2 — Course Catalog Enhancement

### 4.1 Objectives
- Migrate course data from hardcoded arrays to database
- Server-side rendering for SEO
- Advanced filtering, search, and pagination
- Course detail page pulls from DB with ISR

### 4.2 Changes

**Course Listing (`/courses`)**
- Server Component fetching from Prisma directly
- URL-based filter state (`?category=development&level=beginner&page=2`)
- Full-text search with PostgreSQL `tsvector`
- Pagination (12 per page)
- Sort: popularity, price (low/high), newest, rating

**Course Detail (`/courses/[slug]`)**
- Server Component with `generateStaticParams` for popular courses
- ISR with `revalidate: 3600` (1 hour)
- JSON-LD structured data (Course schema)
- Dynamic OG image generation
- Reviews fetched separately (client-side, paginated)
- "Continue Learning" button if already enrolled

### 4.3 Deliverables
- [ ] Migrate all course data to database via seed script
- [ ] Refactor `/courses/page.tsx` to Server Component with Prisma queries
- [ ] Refactor `/courses/[slug]/page.tsx` to Server Component
- [ ] Add pagination component
- [ ] Add search with debounced input
- [ ] JSON-LD + OG meta for each course
- [ ] Related courses recommendation (same category)

---

## 5. Phase 3 — Payment & Checkout (Razorpay)

### 5.1 Objectives
- Implement Razorpay payment flow for course purchases
- Coupon/discount system
- Order management and receipt generation
- Webhook for payment confirmation

### 5.2 New Dependencies
```bash
npm install razorpay crypto
```

### 5.3 Payment Flow

```
Student clicks "Enroll Now"
  → [If not authenticated] → Redirect to login → Return to checkout
  → [If authenticated] → Navigate to /courses/[slug]/checkout

Checkout Page:
  → Display order summary (course, price, discount)
  → Apply coupon (POST /api/coupons/validate)
  → Click "Pay Now"
  → POST /api/payments/create-order (creates Razorpay order)
  → Open Razorpay Checkout modal (client-side)
  → Student completes payment
  → Razorpay callback → POST /api/payments/verify
  → Verify HMAC signature server-side
  → Create Enrollment + Order records
  → Redirect to /dashboard/courses/[courseId]

Webhook (backup):
  → POST /api/payments/webhook
  → Verify webhook signature
  → Idempotent enrollment creation
```

### 5.4 Coupon System
- Admin creates coupons with code, discount type (% or fixed), max uses, expiry
- Student enters code on checkout → validate via API → apply discount
- Coupon usage tracked (increment `usedCount`)
- One coupon per order

### 5.5 Pages & Components to Build
| Item | Description |
|------|-------------|
| `/courses/[slug]/checkout` | Checkout page with order summary |
| `CheckoutForm.tsx` | Order summary + coupon input |
| `RazorpayButton.tsx` | Triggers Razorpay Checkout SDK |
| `PaymentSuccess.tsx` | Post-payment confirmation screen |
| `CouponInput.tsx` | Coupon code input with validation |

### 5.6 API Routes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/create-order` | POST | Create Razorpay order (amount, currency) |
| `/api/payments/verify` | POST | Verify payment signature, enroll student |
| `/api/payments/webhook` | POST | Razorpay webhook handler (idempotent) |
| `/api/coupons/validate` | POST | Validate and apply coupon code |

### 5.7 Deliverables
- [ ] Razorpay server-side client (`src/lib/razorpay.ts`)
- [ ] Checkout page with order summary
- [ ] Razorpay Checkout integration (client-side SDK)
- [ ] Payment verification with HMAC signature
- [ ] Webhook handler (idempotent)
- [ ] Coupon CRUD (admin) + validation (student)
- [ ] Order model + purchase history
- [ ] Confirmation email on successful payment

---

## 6. Phase 4 — Video Player & Learning (Bunny Stream)

### 6.1 Objectives
- Integrate Bunny Stream for video delivery
- Token-authenticated video access (enrolled students only)
- Progress tracking (auto-save watched seconds)
- Lesson navigation with curriculum sidebar

### 6.2 Architecture

```
Enrolled Student → /dashboard/courses/[courseId]/[lessonId]
  → Server verifies enrollment
  → Generate time-limited Bunny embed token
  → Render video player (iframe or Bunny Player SDK)
  → Player events → POST /api/progress (debounced)
  → Mark lesson complete at 90% watched
  → Auto-advance to next lesson
```

### 6.3 Video Security
- Videos are **never** directly accessible by URL
- Embed URL includes token: `https://iframe.mediadelivery.net/embed/{libId}/{videoId}?token={jwt}`
- Token generated server-side, expires in 4 hours
- Referer restriction configured in Bunny dashboard

### 6.4 Progress Tracking
- Client listens to `timeupdate` events from player
- Debounced save every 10 seconds → `PATCH /api/progress`
- Stores: `enrollmentId`, `lessonId`, `watched` (seconds), `completed` (boolean)
- Lesson marked complete when `watched >= 0.9 * duration`
- Course marked complete when all lessons completed → trigger certificate generation

### 6.5 Pages & Components
| Item | Description |
|------|-------------|
| `/dashboard/courses/[courseId]` | Course curriculum view |
| `/dashboard/courses/[courseId]/[lessonId]` | Lesson player view |
| `VideoPlayer.tsx` | Bunny Stream iframe/SDK wrapper |
| `LessonSidebar.tsx` | Curriculum navigation (collapsible) |
| `LessonNotes.tsx` | Notes/resources panel |
| `VideoProgress.tsx` | Progress tracking overlay |

### 6.6 API Routes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses/[courseId]/progress` | GET | Get all lesson progress for enrollment |
| `/api/courses/[courseId]/progress` | PATCH | Update lesson progress (watched, completed) |
| `/api/courses/[courseId]/token` | GET | Generate Bunny embed token for lesson |

### 6.7 Deliverables
- [ ] Bunny Stream API client (`src/lib/bunny.ts`)
- [ ] Video player component with token auth
- [ ] Lesson player page with curriculum sidebar
- [ ] Progress auto-save (debounced)
- [ ] Lesson completion detection (90% threshold)
- [ ] Course completion detection + certificate trigger
- [ ] Resource download for enrolled students (R2 presigned URLs)

---

## 7. Phase 5 — Student Dashboard

### 7.1 Objectives
- Personal dashboard showing enrolled courses, progress, activity
- Continue learning (resume from last lesson)
- Certificates, bookmarks, order history
- Profile settings

### 7.2 Pages
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview — enrolled courses, stats, activity feed |
| `/dashboard/courses` | My enrolled courses grid with progress bars |
| `/dashboard/courses/[courseId]` | Course player (Phase 4) |
| `/dashboard/certificates` | Earned certificates (downloadable PDF) |
| `/dashboard/bookmarks` | Bookmarked lessons |
| `/dashboard/orders` | Purchase history with receipts |
| `/dashboard/settings` | Profile, password, notification preferences |

### 7.3 Dashboard Layout
- **Sidebar** (desktop) / **Bottom nav** (mobile) with navigation links
- **Topbar** with user avatar, notifications bell, search
- Content area with consistent padding and card-based layouts
- Minimal animations — functional-first UI

### 7.4 Components
| Component | Description |
|-----------|-------------|
| `DashboardSidebar.tsx` | Navigation sidebar (collapsible) |
| `DashboardTopbar.tsx` | Top bar with user menu |
| `EnrolledCourseCard.tsx` | Course card with progress bar |
| `ProgressChart.tsx` | Visual progress (lessons completed, hours watched) |
| `ActivityFeed.tsx` | Recent activity list |
| `CertificateCard.tsx` | Certificate display + download |

### 7.5 Deliverables
- [ ] Dashboard layout (sidebar + topbar + content)
- [ ] Overview page with enrolled courses + stats
- [ ] Continue learning widget (resume last lesson)
- [ ] Certificate generation (PDF with course name, student, date)
- [ ] Order history with Razorpay receipt links
- [ ] Profile settings (name, avatar, password change)
- [ ] Bookmark lessons feature

---

## 8. Phase 6 — Admin Panel

### 8.1 Objectives
- Full course management CRUD (create, edit, publish, archive)
- Curriculum editor (modules + lessons with video upload)
- Student management (view, enrollments, refunds)
- Revenue analytics and order management
- Coupon management
- Review moderation
- Media library (R2 + Bunny)

### 8.2 Pages
| Route | Description |
|-------|-------------|
| `/admin` | Overview — revenue, enrollments, popular courses |
| `/admin/courses` | All courses list (CRUD) |
| `/admin/courses/new` | Create new course form |
| `/admin/courses/[courseId]` | Edit course details |
| `/admin/courses/[courseId]/curriculum` | Manage modules & lessons |
| `/admin/courses/[courseId]/analytics` | Course-specific analytics |
| `/admin/students` | Student list with filters |
| `/admin/orders` | All orders/payments |
| `/admin/coupons` | Coupon CRUD |
| `/admin/reviews` | Review moderation queue |
| `/admin/media` | Media library (uploaded files) |
| `/admin/settings` | Platform settings |

### 8.3 Key Features

**Course Management**
- Rich form: title, slug (auto-generated), description (rich text), pricing, thumbnail upload, category, level, tags
- Status workflow: Draft → Published → Archived
- Feature toggle (show on homepage)

**Curriculum Editor**
- Drag-and-drop module reordering
- Add lessons to modules (title, video upload, duration, resources, isFree toggle)
- Video upload → Bunny Stream API → returns videoId
- Resource upload → Cloudflare R2 → returns URL
- Bulk actions (delete module, move lessons)

**Analytics Dashboard**
- Revenue charts (daily, weekly, monthly)
- Enrollment trends
- Course completion rates
- Popular courses ranking
- Student growth metrics
- Average rating per course

### 8.4 Components
| Component | Description |
|-----------|-------------|
| `AdminSidebar.tsx` | Admin navigation |
| `AdminTopbar.tsx` | Admin top bar |
| `StatsCard.tsx` | Metric display card |
| `DataTable.tsx` | Reusable sortable/filterable table |
| `CourseForm.tsx` | Course create/edit form |
| `CurriculumEditor.tsx` | Drag-drop curriculum builder |
| `MediaUploader.tsx` | File upload to R2/Bunny |
| `OrdersTable.tsx` | Orders list with filters |
| `RevenueChart.tsx` | Revenue visualization |

### 8.5 API Routes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/courses` | GET/POST | List/create courses |
| `/api/admin/courses/[id]` | GET/PATCH/DELETE | Single course CRUD |
| `/api/admin/courses/[id]/modules` | POST/PATCH/DELETE | Module management |
| `/api/admin/courses/[id]/lessons` | POST/PATCH/DELETE | Lesson management |
| `/api/admin/students` | GET | List students with enrollments |
| `/api/admin/orders` | GET | List all orders |
| `/api/admin/orders/[id]/refund` | POST | Process refund |
| `/api/admin/coupons` | GET/POST/PATCH/DELETE | Coupon CRUD |
| `/api/admin/reviews` | GET/PATCH/DELETE | Review moderation |
| `/api/admin/analytics` | GET | Revenue & enrollment stats |
| `/api/upload/video` | POST | Upload to Bunny Stream |
| `/api/upload/image` | POST | Upload to R2 |
| `/api/upload/document` | POST | Upload PDF/notes to R2 |

### 8.6 Deliverables
- [ ] Admin layout (sidebar + topbar)
- [ ] Admin overview with revenue/enrollment charts
- [ ] Course CRUD with rich form
- [ ] Curriculum editor (drag-drop modules/lessons)
- [ ] Video upload integration (Bunny Stream)
- [ ] Image/document upload (Cloudflare R2)
- [ ] Student management table
- [ ] Order management + refund processing
- [ ] Coupon CRUD
- [ ] Review moderation queue
- [ ] Media library browser

---

## 9. Phase 7 — Advanced Features

### 9.1 Certificate Generation
- Auto-generated on course completion
- PDF with student name, course title, completion date, unique certificate ID
- Shareable link + LinkedIn integration
- Verified via public URL (`/certificates/[id]`)

### 9.2 Email Notifications
- Welcome email on registration
- Payment confirmation with receipt
- Course enrollment confirmation
- Course completion + certificate link
- Password reset link
- Weekly progress digest (optional)

### 9.3 Search & Discovery
- Full-text search across courses (PostgreSQL `tsvector`)
- Search suggestions / autocomplete
- Recently viewed courses
- Personalized recommendations (based on enrollments)

### 9.4 Reviews & Ratings
- Students can review after enrolling
- Star rating (1-5) + title + comment
- Verified purchase badge
- Helpful vote system
- Admin moderation queue
- Average rating calculation + display

### 9.5 Notifications
- In-app notification bell
- New course published (if in wishlist category)
- Payment received
- Certificate earned
- Course update (new lessons added)

---

## 10. Phase 8 — Production Hardening

### 10.1 Performance
- [ ] ISR for course pages (revalidate on publish)
- [ ] Image optimization — move all images to R2 + Next.js `<Image>`
- [ ] Bundle analysis + code splitting for admin panel
- [ ] Redis caching for expensive queries (course listings, analytics)
- [ ] CDN configuration for static assets
- [ ] Database query optimization (indexes, connection pooling)

### 10.2 Security
- [ ] Rate limiting on auth endpoints (login, register, forgot-password)
- [ ] Rate limiting on payment endpoints
- [ ] Input sanitization (XSS prevention) on user-generated content
- [ ] CSRF protection via NextAuth
- [ ] Content Security Policy headers
- [ ] Dependency audit + automated updates (Dependabot)

### 10.3 Monitoring & Observability
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics or custom)
- [ ] Uptime monitoring
- [ ] Payment failure alerting
- [ ] Server-side logging (structured JSON logs)

### 10.4 Testing
- [ ] Unit tests for utility functions and API logic (Vitest)
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows — purchase, login, video playback (Playwright)
- [ ] Visual regression tests for marketing pages

### 10.5 DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker multi-stage build
- [ ] Environment-specific configs (dev, staging, prod)
- [ ] Database migration strategy (Prisma migrate)
- [ ] Backup strategy for PostgreSQL
- [ ] Zero-downtime deployments

### 10.6 SEO & Marketing
- [ ] Sitemap generation (dynamic from published courses)
- [ ] robots.txt configuration
- [ ] Dynamic OG images per course
- [ ] Blog/content section (future — for organic traffic)
- [ ] Schema.org markup (Course, Review, Organization)

---

## 11. Integration Architecture (Target State)

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                  │
│                                                          │
│  Marketing │ Course Pages │ Dashboard │ Admin Panel      │
│            │              │           │                   │
│  Server Components ←→ Prisma (direct DB access)         │
│  Client Components ←→ API Route Handlers                │
└────────┬───────────────┬──────────────┬─────────────────┘
         │               │              │
    ┌────▼────┐    ┌────▼────┐   ┌────▼─────┐
    │ Prisma  │    │ Bunny   │   │ Razorpay │
    │   +     │    │ Stream  │   │          │
    │ Postgres│    │ (Video) │   │ (Payment)│
    └─────────┘    └─────────┘   └──────────┘
                        │
                   ┌────▼─────┐
                   │Cloudflare│
                   │    R2    │
                   │ (Assets) │
                   └──────────┘
```

---

## 12. Estimated Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Auth & DB | 1–2 weeks | Critical |
| Phase 2: Catalog Enhancement | 1 week | High |
| Phase 3: Payments | 1–2 weeks | Critical |
| Phase 4: Video Player | 1–2 weeks | Critical |
| Phase 5: Student Dashboard | 2 weeks | High |
| Phase 6: Admin Panel | 3–4 weeks | High |
| Phase 7: Advanced Features | 2–3 weeks | Medium |
| Phase 8: Production Hardening | 2 weeks | High |

**Total estimated: 13–18 weeks** (3–4.5 months) for full platform launch.

---

## 13. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Razorpay integration issues | High | Medium | Test with Razorpay sandbox early; handle all edge cases in webhook |
| Bunny Stream token auth complexity | Medium | Medium | Build token generation utility early; test with private videos |
| Database migration breaking changes | High | Low | Use Prisma migrate; always test migrations on staging first |
| Performance degradation with scale | Medium | Medium | Add Redis caching layer; optimize Prisma queries; use ISR |
| Video piracy / URL leakage | Medium | Low | Token-authenticated embeds; short TTL; Bunny DRM features |
| Payment disputes / refunds | Medium | Medium | Clear refund policy; Razorpay dispute handling; idempotent webhooks |

---

## 14. Open Questions

1. **Self-hosted backend vs Next.js API routes?** — Currently using external `codepath-api`. Decision: migrate API logic into Next.js API routes for simplicity, or keep separate?
2. **Subscription model later?** — One-time purchase initially. When to introduce all-access subscription?
3. **Mobile app?** — React Native app planned for V2. When to start?
4. **Live classes?** — Zoom/Google Meet integration. Scope and timeline?
5. **Multi-instructor support?** — Allow external instructors to upload courses? Revenue sharing model?
6. **Internationalization?** — Hindi content? Multi-language UI?
