---
inclusion: auto
---

# CodePath LMS — Feature Roadmap & Implementation Guide

## Feature Status Legend
- ✅ **Done** — Implemented and working
- 🚧 **In Progress** — Partially built
- 📋 **Planned** — Designed, not yet started
- 💡 **Future** — V2+ consideration

---

## Phase 0: Marketing Landing (✅ Done)

These components are already built and functional:

| Feature | Status | Component |
|---------|--------|-----------|
| Navbar with mobile menu | ✅ | `Navbar.tsx` |
| Hero section with animations | ✅ | `Hero.tsx` |
| Stats section (animated counters) | ✅ | `Stats.tsx` |
| Course showcase grid | ✅ | `Courses.tsx` |
| How It Works (steps) | ✅ | `HowItWorks.tsx` |
| Placements marquee | ✅ | `Placements.tsx` |
| Testimonials | ✅ | `Testimonials.tsx` |
| FAQ accordion | ✅ | `FAQ.tsx` |
| CTA section | ✅ | `CTA.tsx` |
| Footer | ✅ | `Footer.tsx` |
| Dark/Light theme toggle | ✅ | `ThemeProvider.tsx` |
| Courses listing page | ✅ | `app/courses/page.tsx` |
| Responsive design | ✅ | All components |
| Spotlight card effect | ✅ | `globals.css` + Courses |

---

## Phase 1: Foundation & Auth (📋 Planned)

### 1.1 Database Setup
| Feature | Details |
|---------|---------|
| Prisma schema | User, Course, Module, Lesson, Enrollment, Order, Review, Coupon models |
| PostgreSQL connection | Via `DATABASE_URL` env var |
| Seed data | Sample courses, admin user, test data |
| Migrations | Initial migration with all models |

**Prisma Schema (Key Models):**
```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?   // null for OAuth users
  avatar        String?
  role          Role      @default(STUDENT)
  emailVerified DateTime?
  enrollments   Enrollment[]
  reviews       Review[]
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Course {
  id          String       @id @default(cuid())
  title       String
  slug        String       @unique
  description String?      @db.Text
  shortDesc   String?      @db.VarChar(300)
  thumbnail   String?      // R2 public URL
  price       Int          // In paise (₹14999 = 1499900)
  salePrice   Int?         // Discounted price in paise
  duration    String?      // "8.5 months"
  level       CourseLevel  @default(BEGINNER)
  status      CourseStatus @default(DRAFT)
  featured    Boolean      @default(false)
  category    String?
  tags        String[]
  instructor  User         @relation(fields: [instructorId], references: [id])
  instructorId String
  modules     Module[]
  enrollments Enrollment[]
  reviews     Review[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Module {
  id        String   @id @default(cuid())
  title     String
  position  Int
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  courseId   String
  lessons   Lesson[]
  createdAt DateTime @default(now())
}

model Lesson {
  id          String     @id @default(cuid())
  title       String
  description String?
  position    Int
  duration    Int?       // Duration in seconds
  videoId     String?    // Bunny Stream video ID
  isFree      Boolean    @default(false) // Free preview lesson
  resources   Resource[]
  module      Module     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  moduleId    String
  progress    LessonProgress[]
  createdAt   DateTime   @default(now())
}

model Resource {
  id       String       @id @default(cuid())
  title    String
  type     ResourceType // PDF, CODE, LINK, IMAGE
  url      String       // R2 URL or external link
  size     Int?         // File size in bytes
  lesson   Lesson       @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  lessonId String
}

model Enrollment {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  course    Course   @relation(fields: [courseId], references: [id])
  courseId   String
  order     Order?   @relation(fields: [orderId], references: [id])
  orderId   String?
  progress  LessonProgress[]
  completedAt DateTime?
  createdAt DateTime @default(now())

  @@unique([userId, courseId])
}

model LessonProgress {
  id           String     @id @default(cuid())
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  enrollmentId String
  lesson       Lesson     @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  lessonId     String
  watched      Int        @default(0) // Seconds watched
  completed    Boolean    @default(false)
  completedAt  DateTime?
  updatedAt    DateTime   @updatedAt

  @@unique([enrollmentId, lessonId])
}

model Order {
  id              String      @id @default(cuid())
  user            User        @relation(fields: [userId], references: [id])
  userId          String
  amount          Int         // Amount paid in paise
  currency        String      @default("INR")
  status          OrderStatus @default(PENDING)
  razorpayOrderId String?     @unique
  razorpayPaymentId String?
  razorpaySignature String?
  coupon          Coupon?     @relation(fields: [couponId], references: [id])
  couponId        String?
  enrollment      Enrollment[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Coupon {
  id          String     @id @default(cuid())
  code        String     @unique
  type        CouponType // PERCENTAGE, FIXED
  value       Int        // Percentage (0-100) or fixed amount in paise
  maxUses     Int?       // null = unlimited
  usedCount   Int        @default(0)
  minAmount   Int?       // Minimum order amount in paise
  validFrom   DateTime   @default(now())
  validUntil  DateTime?
  isActive    Boolean    @default(true)
  orders      Order[]
  createdAt   DateTime   @default(now())
}

model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5
  comment   String?  @db.Text
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  course    Course   @relation(fields: [courseId], references: [id])
  courseId   String
  approved  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@unique([userId, courseId])
}

enum Role { STUDENT INSTRUCTOR ADMIN }
enum CourseStatus { DRAFT PUBLISHED ARCHIVED }
enum CourseLevel { BEGINNER INTERMEDIATE ADVANCED ALL_LEVELS }
enum OrderStatus { PENDING PAID FAILED REFUNDED }
enum CouponType { PERCENTAGE FIXED }
enum ResourceType { PDF CODE LINK IMAGE }
```

### 1.2 Authentication
| Feature | Details |
|---------|---------|
| Email/password registration | Bcrypt hashing, email verification |
| Email/password login | NextAuth Credentials provider |
| Google OAuth | NextAuth Google provider |
| Password reset flow | Token-based email reset |
| Protected routes middleware | `/dashboard/*`, `/admin/*` |
| Role-based access | Student vs Instructor vs Admin |
| Session management | JWT strategy, httpOnly cookies |
| Login/Register pages | Beautiful auth forms with theme support |

### 1.3 Core Lib Services
| File | Purpose |
|------|---------|
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | NextAuth config (providers, callbacks, pages) |
| `src/lib/bunny.ts` | Bunny Stream API (upload, list, delete, get embed URL) |
| `src/lib/r2.ts` | R2 client (upload, presigned URLs, delete) |
| `src/lib/razorpay.ts` | Razorpay client (create order, verify signature) |
| `src/lib/email.ts` | Email service (welcome, receipt, reset) |
| `src/lib/validations.ts` | Zod schemas for all forms/APIs |

---

## Phase 2: Course Catalog & Detail Pages (📋 Planned)

### 2.1 Course Catalog (`/courses`)
| Feature | Details |
|---------|---------|
| Full course listing | Server-rendered, paginated |
| Search | Debounced text search across title, description |
| Filters | Category, level, price range, duration |
| Sort | Popularity, price (low/high), newest, rating |
| Category tabs | Same as landing but full page |
| Responsive grid | 1 col mobile, 2 col tablet, 3 col desktop |
| URL state | Filters persisted in URL params |
| Empty state | "No courses found" with suggestions |

### 2.2 Course Detail (`/courses/[slug]`)
| Feature | Details |
|---------|---------|
| Course hero | Banner image, title, key stats |
| Video preview | Free preview lesson plays in hero |
| Syllabus accordion | Modules → Lessons (expandable) |
| Lesson count & duration | Per-module and total |
| Free lessons marked | "Free Preview" badge |
| Instructor card | Avatar, bio, other courses |
| Reviews section | Rating distribution + individual reviews |
| Related courses | Algorithm-based recommendations |
| Sticky pricing sidebar | Price, CTA, key benefits (desktop) |
| Mobile bottom bar | Fixed price + "Enroll Now" (mobile) |
| Already enrolled state | "Continue Learning" CTA if enrolled |
| SEO | Course structured data, unique meta |

### 2.3 Course Card Component
| Feature | Details |
|---------|---------|
| Thumbnail with gradient overlay | Next.js Image, lazy loaded |
| Category badge | Top-left colored badge |
| Rating + student count | Star rating, enrollment count |
| Price with discount | Strikethrough original, sale price |
| Spotlight hover effect | Mouse-follow radial gradient |
| Hover lift | `translateY(-8px)` with spring |
| Link to detail page | Wraps entire card |

---

## Phase 3: Payment & Checkout (📋 Planned)

### 3.1 Checkout Page (`/courses/[slug]/checkout`)
| Feature | Details |
|---------|---------|
| Order summary | Course title, thumbnail, price breakdown |
| Coupon input | Enter code, validate via API, show discount |
| Price breakdown | Original → Discount → GST (if applicable) → Final |
| "Pay Now" button | Opens Razorpay Checkout modal |
| Login required | Redirect to login if not authenticated |
| Loading states | Skeleton while verifying coupon, spinner on pay |
| Success page | Confetti/animation, "Start Learning" CTA |
| Failure handling | Error toast, retry option |

### 3.2 Razorpay Integration
| Feature | Details |
|---------|---------|
| Create order API | `POST /api/payments/create-order` |
| Verify payment API | `POST /api/payments/verify` |
| Webhook handler | `POST /api/payments/webhook` (idempotent) |
| Checkout.js integration | Dynamic script loading, prefill user data |
| Payment methods | UPI, Cards, NetBanking, Wallets, EMI |
| Receipt generation | Order ID as receipt |
| Refund handling | Admin-initiated via Razorpay dashboard (V1) |

### 3.3 Coupon System
| Feature | Details |
|---------|---------|
| Validate coupon API | `POST /api/coupons/validate` |
| Coupon types | Percentage off, fixed amount off |
| Constraints | Min order amount, max uses, date range |
| Admin CRUD | Create, edit, deactivate coupons |
| Usage tracking | Increment `usedCount` on successful payment |

---

## Phase 4: Student Dashboard (📋 Planned)

### 4.1 Dashboard Home (`/dashboard`)
| Feature | Details |
|---------|---------|
| Welcome banner | Personalized greeting + learning streak |
| Quick stats | Courses enrolled, lessons completed, hours watched |
| Continue learning | Resume from last watched lesson |
| Enrolled courses grid | Cards with progress bars |
| Recent activity | Last 5 actions (watched, completed, enrolled) |
| Recommended courses | Based on category of enrolled courses |

### 4.2 My Courses (`/dashboard/courses`)
| Feature | Details |
|---------|---------|
| Enrolled course cards | Thumbnail, title, progress %, last accessed |
| Progress bar | Visual completion percentage |
| Filter | All, In Progress, Completed |
| Sort | Recently accessed, alphabetical, completion |
| Empty state | "No courses yet" + browse CTA |

### 4.3 Course Player (`/dashboard/courses/[courseId]`)
| Feature | Details |
|---------|---------|
| Bunny Stream video player | Iframe embed with token auth |
| Curriculum sidebar | Collapsible, shows all modules/lessons |
| Current lesson highlight | Active lesson visually distinguished |
| Completion checkmarks | Green check on completed lessons |
| Auto-advance | Next lesson plays on video end |
| Progress auto-save | Every 30s + on pause/close via API |
| Lesson notes tab | View/download attached resources |
| Keyboard shortcuts | Space (play/pause), N (next), P (previous) |

### 4.4 Video Progress Tracking
| Feature | Details |
|---------|---------|
| Track watch time | Seconds watched stored in `LessonProgress` |
| Auto-complete | Mark complete when 90%+ watched |
| Resume from position | Load last position on re-visit |
| Course completion | Auto-detect when all lessons complete |
| Certificate trigger | Generate cert on course completion |

### 4.5 Certificates (`/dashboard/certificates`)
| Feature | Details |
|---------|---------|
| Auto-generated | On course completion (all lessons done) |
| PDF download | Generated with course + student info |
| Share link | Public URL for verification |
| Certificate card | Preview with download/share buttons |
| LinkedIn share | One-click add to LinkedIn |

### 4.6 Other Dashboard Pages
| Feature | Route | Details |
|---------|-------|---------|
| Bookmarks | `/dashboard/bookmarks` | Saved lessons for later |
| Progress analytics | `/dashboard/progress` | Charts, weekly hours, streaks |
| Order history | `/dashboard/orders` | Past purchases with receipts |
| Settings | `/dashboard/settings` | Name, email, password, avatar |

---

## Phase 5: Admin Panel (📋 Planned)

### 5.1 Admin Dashboard (`/admin`)
| Feature | Details |
|---------|---------|
| Revenue cards | Today, this week, this month, total |
| Enrollment chart | Line chart (last 30 days) |
| Recent orders | Latest 10 orders with status |
| Popular courses | Top 5 by enrollment |
| Student growth | New registrations chart |
| Quick actions | Create course, view orders, manage students |

### 5.2 Course Management (`/admin/courses`)
| Feature | Details |
|---------|---------|
| Courses data table | Title, status, enrollments, revenue, actions |
| Create course | Multi-step form (details → curriculum → pricing → publish) |
| Edit course | Same form pre-filled |
| Status management | Draft → Published → Archived |
| Feature toggle | Mark/unmark as featured |
| Duplicate course | Clone course structure |
| Delete course | Soft delete with confirmation |

### 5.3 Curriculum Editor (`/admin/courses/[courseId]/curriculum`)
| Feature | Details |
|---------|---------|
| Module CRUD | Add, edit, reorder, delete modules |
| Lesson CRUD | Add, edit, reorder, delete lessons per module |
| Drag-drop reorder | Reorder modules and lessons visually |
| Video upload | Upload to Bunny Stream directly |
| Resource upload | Upload PDFs/notes to R2 |
| Free preview toggle | Mark lessons as free preview |
| Bulk actions | Delete multiple, change order |

### 5.4 Media Library (`/admin/media`)
| Feature | Details |
|---------|---------|
| Video library | All Bunny Stream videos, usage, status |
| File library | All R2 assets, grouped by type |
| Upload interface | Drag-drop upload for images, PDFs |
| Video upload | Direct to Bunny with progress bar |
| Delete management | Remove unused media |
| Usage tracking | Which course/lesson uses each asset |

### 5.5 Student Management (`/admin/students`)
| Feature | Details |
|---------|---------|
| Students table | Name, email, enrolled courses, joined date |
| Student detail | Profile, enrollments, progress, orders |
| Manual enrollment | Enroll student in a course (no payment) |
| Ban/suspend | Disable account access |
| Export | CSV export of student data |

### 5.6 Order Management (`/admin/orders`)
| Feature | Details |
|---------|---------|
| Orders table | Student, course, amount, status, date |
| Order detail | Full payment info, Razorpay reference |
| Refund initiation | Mark as refunded (process via Razorpay dashboard) |
| Revenue reports | Filter by date range, course, status |
| Export | CSV export of orders |

### 5.7 Coupon Management (`/admin/coupons`)
| Feature | Details |
|---------|---------|
| Coupons table | Code, type, value, uses, status, expiry |
| Create coupon | Code, type, value, constraints, dates |
| Edit/deactivate | Toggle active status |
| Usage analytics | Which orders used which coupon |

### 5.8 Review Moderation (`/admin/reviews`)
| Feature | Details |
|---------|---------|
| Reviews table | Course, student, rating, comment, status |
| Approve/reject | Moderation workflow |
| Bulk actions | Approve/reject multiple |

---

## Phase 6: Email & Notifications (📋 Planned)

| Email Type | Trigger | Content |
|------------|---------|---------|
| Welcome | Registration | Welcome message, getting started guide |
| Email verification | Registration | Verify email link |
| Password reset | Forgot password | Reset link (expires in 1hr) |
| Payment receipt | Successful payment | Order details, amount, course access link |
| Enrollment confirmation | After payment | Course name, start learning CTA |
| Course completion | All lessons done | Congratulations, certificate link |
| New course launch | Admin sends | Promotional, course details, enroll CTA |

---

## Phase 7: SEO & Performance (📋 Planned)

| Feature | Details |
|---------|---------|
| Structured data | Course, Organization, BreadcrumbList schemas |
| Dynamic OG images | Generated per course for social sharing |
| Sitemap | Auto-generated for all public pages |
| Robots.txt | Proper crawl directives |
| ISR | Incremental Static Regeneration for course pages |
| Image optimization | WebP/AVIF via Next.js Image, R2 CDN |
| Bundle analysis | Minimize client JS, code split routes |
| Core Web Vitals | LCP < 2.5s, CLS < 0.1, INP < 200ms |

---

## Phase 8: Future Enhancements (💡 V2+)

| Feature | Priority | Details |
|---------|----------|---------|
| Live classes | High | Zoom/Meet integration, schedule in admin |
| Discussion forum | High | Q&A per lesson, threaded replies |
| Coding playground | Medium | Embedded Monaco editor for practice |
| Assignments | Medium | Submit code, auto-grade or manual review |
| Gamification | Medium | XP points, badges, daily streaks, leaderboard |
| Referral program | Medium | Unique codes, reward on referral purchase |
| Subscription model | Low | All-access pass, monthly/yearly billing |
| Mobile app | Low | React Native, offline video (Bunny offline SDK) |
| Instructor payouts | Low | Revenue share, withdrawal requests |
| Multi-language | Low | i18n for Hindi + English |
| AI tutor | Low | ChatGPT-powered doubt resolution per lesson |
| Bulk enrollment | Low | Enterprise B2B, cohort management |

---

## Implementation Priority Order

When building new features, follow this priority:

1. **Database + Auth** (Phase 1) — foundation for everything.
2. **Course Detail + Catalog** (Phase 2) — public-facing, drives traffic.
3. **Checkout + Payments** (Phase 3) — revenue generation.
4. **Student Dashboard + Player** (Phase 4) — core learning experience.
5. **Admin Panel** (Phase 5) — content management.
6. **Email + Notifications** (Phase 6) — user engagement.
7. **SEO + Performance** (Phase 7) — growth optimization.
8. **V2 Features** (Phase 8) — based on user feedback.

---

## Integration Patterns

### Bunny Stream Video Upload (Admin)
```
Admin selects video file
→ Client: POST /api/upload/video (metadata)
→ Server: Create video on Bunny API, get upload URL
→ Client: Upload file directly to Bunny via TUS protocol
→ Bunny: Transcodes video (async)
→ Server: Store Bunny video ID in Lesson record
```

### Bunny Stream Video Playback (Student)
```
Student opens lesson
→ Server: Verify enrollment
→ Server: Generate signed embed URL (time-limited token)
→ Client: Render iframe with signed URL
→ Player: HLS adaptive streaming, DRM protected
→ Client: Track progress events → POST /api/courses/[id]/progress
```

### Cloudflare R2 File Upload (Admin)
```
Admin selects file (image/PDF)
→ Client: POST /api/upload/image or /api/upload/document
→ Server: Generate presigned upload URL for R2
→ Client: PUT file directly to R2 presigned URL
→ Client: Confirm upload, store R2 URL in DB
```

### Cloudflare R2 File Download (Student)
```
Student clicks "Download Notes"
→ Client: GET /api/courses/[id]/resources/[resourceId]
→ Server: Verify enrollment
→ Server: Generate presigned download URL (5min expiry)
→ Client: Redirect to presigned URL → file downloads
```

### Razorpay Payment Flow
```
Student clicks "Pay Now"
→ Client: POST /api/payments/create-order { courseId, couponCode? }
→ Server: Validate course, apply coupon, create Razorpay order
→ Client: Open Razorpay Checkout with order_id
→ Student completes payment
→ Razorpay: Callback to client with payment details
→ Client: POST /api/payments/verify { orderId, paymentId, signature }
→ Server: Verify HMAC signature
→ Server: Update order status, create enrollment
→ Server: Send confirmation email
→ Client: Redirect to success page

// Backup: Razorpay webhook
→ Razorpay: POST /api/payments/webhook
→ Server: Verify webhook signature
→ Server: If order not already processed, process it (idempotent)
```
