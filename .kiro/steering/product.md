---
inclusion: auto
---

# Product Overview — CodePath LMS

## What It Is
A full-featured Learning Management System (LMS) for CodePath — an online coding education platform. Students purchase courses, watch video lectures (Bunny Stream), download resources (Cloudflare R2), track progress, and earn certificates. Instructors/admins manage content, students, and revenue through an admin panel.

## Brand Identity
- **Name**: CodePath
- **Tagline**: "Learn to Code. Get Hired."
- **Domain**: codepath.dev (planned)
- **Colors**: Indigo-violet brand (#7c6fff), cyan accent (#22d3ee)
- **Voice**: Professional yet approachable. Structured, outcome-driven, student-first.

## Target Audience
- **College students** — preparing for placements, need DSA + Full Stack skills.
- **Career switchers** — professionals moving into tech, self-paced learners.
- **Working developers** — upskilling in system design, DevOps, AI/ML.
- **Fresh graduates** — job-ready skills with portfolio projects and placement support.

## User Roles

### Student (Default)
- Browse course catalog
- Purchase courses via Razorpay
- Watch video lectures (Bunny Stream HLS)
- Track lesson progress (auto-saved)
- Download notes, PDFs, code resources (R2)
- Bookmark lessons for later
- Leave course reviews
- Earn completion certificates
- Manage profile and settings

### Instructor (Content Creator)
- Create and manage courses
- Upload videos to Bunny Stream
- Upload resources to Cloudflare R2
- View course analytics (enrollments, completions, revenue)
- Respond to student queries (future: Q&A)

### Admin (Platform Owner)
- Full access to all instructor capabilities
- Manage students (view, ban, refund)
- Manage all courses (approve, feature, archive)
- Create/manage discount coupons
- View platform-wide analytics and revenue
- Moderate reviews
- Platform settings (branding, SEO, integrations)

## Core User Journeys

### Journey 1: Student Purchases a Course
```
Landing Page → Browse Courses → Course Detail Page → Click "Enroll Now"
→ Login (if not authenticated) → Checkout Page (apply coupon, see total)
→ Razorpay Payment → Payment Success → Redirected to Course Dashboard
→ Start Watching Lessons
```

### Journey 2: Student Learns
```
Dashboard → My Courses → Select Course → Curriculum Sidebar
→ Click Lesson → Video Player (Bunny Stream) → Watch + Auto-Progress
→ Mark Complete → Next Lesson → Download Notes → Complete Course
→ Earn Certificate → Share on LinkedIn
```

### Journey 3: Admin Creates a Course
```
Admin Panel → Courses → New Course → Fill Details (title, description, price, thumbnail)
→ Create Modules → Add Lessons (upload video, add resources)
→ Set Pricing & Coupons → Publish Course → Live on Catalog
```

### Journey 4: Payment Flow (Razorpay)
```
Client: Click "Pay Now" → API: Create Razorpay Order → Client: Open Razorpay Checkout
→ Student Pays (UPI/Card/NetBanking) → Razorpay Callback → API: Verify Signature
→ Confirm Payment → Enroll Student → Send Confirmation Email
→ Razorpay Webhook (backup verification)
```

## Core Sections (Marketing Landing)

### Hero
- Bold headline with animated shimmer text.
- Trust badges (students, rating, lectures, placements).
- Tech stack pills.
- Primary CTA: "Explore Courses" → scrolls to courses section.
- Secondary CTA: "Watch Preview" with play button.

### Stats
- Animated counter numbers (120K+ students, 4.9/5 rating, etc.).
- Visual impact section.

### Courses
- Featured course hero card (shimmer border).
- Category filter tabs (All, Popular, Development, Data & AI, DevOps).
- Course cards grid with image, pricing, highlights, enroll CTA.

### How It Works
- Step-by-step process: Choose → Learn → Build → Get Placed.
- Animated connector line between steps.

### Placements
- Company logos marquee (placed students' companies).
- Placement statistics.

### Testimonials
- Student success stories with avatars, ratings, outcomes.
- Testimonial cards with hover effects.

### FAQ
- Expandable accordion with common questions.
- Categories: General, Courses, Payments, Support.

### CTA
- Final call-to-action section with email capture or direct link.

### Footer
- Navigation links, social media, contact info.
- Newsletter subscription.

## Functional Pages (Beyond Landing)

### Course Catalog (`/courses`)
- Full course listing with search, filters, sorting.
- Filter by: category, price range, duration, rating, level.
- Sort by: popularity, price, newest, rating.
- Pagination or infinite scroll.

### Course Detail (`/courses/[slug]`)
- Hero banner with course image/video preview.
- Key info: duration, students enrolled, rating, last updated.
- Full syllabus (modules → lessons, expandable).
- Instructor bio card.
- Student reviews with star ratings.
- Related courses section.
- Sticky pricing sidebar (desktop) or bottom bar (mobile).
- "Enroll Now" / "Continue Learning" CTA.

### Checkout (`/courses/[slug]/checkout`)
- Order summary (course, original price, discount, final price).
- Coupon code input with validation.
- Payment method selection (Razorpay handles this).
- "Pay Now" button triggering Razorpay Checkout.
- Success/failure handling with appropriate redirects.

### Student Dashboard (`/dashboard`)
- Welcome banner with name and streak.
- Enrolled courses grid with progress bars.
- Recent activity feed.
- Quick stats (courses enrolled, lessons completed, hours watched).
- Continue learning section (resume from last lesson).

### Course Player (`/dashboard/courses/[courseId]`)
- Full-width video player (Bunny Stream embed).
- Curriculum sidebar (collapsible on mobile).
- Lesson list with completion checkmarks.
- Notes/resources tab for current lesson.
- Auto-advance to next lesson.
- Progress auto-saves on video progress events.

### Admin Dashboard (`/admin`)
- Revenue overview (today, this week, this month, total).
- Enrollment chart (line/bar chart).
- Recent orders table.
- Popular courses ranking.
- Student count and growth metrics.

## Key Constraints
- **Video content is protected** — Bunny Stream token auth, no direct URL exposure.
- **Assets on R2** — thumbnails public, notes/PDFs require enrollment verification.
- **Razorpay webhooks** — must be idempotent (handle duplicate webhook events).
- **Mobile-first** — full responsive support, video player adapts.
- **SEO** — course pages are server-rendered with structured data (Course schema).
- **Performance** — video player lazy-loaded, images optimized, ISR for course pages.
- **No piracy** — video embed with DRM (Bunny Stream handles), no download option.
- **Indian market** — INR currency, UPI support, GST handling if needed.

## Pricing Model
- **One-time purchase** per course (no subscription model initially).
- Coupon system for discounts (percentage or fixed amount).
- Bundle pricing (buy multiple courses at discount — future).
- EMI option via Razorpay (for courses above ₹5000).

## Email Notifications
- Welcome email on registration.
- Payment confirmation with receipt.
- Course enrollment confirmation.
- Course completion + certificate.
- Password reset.
- Promotional emails (new course launch, sale).

## Future Enhancements (V2+)
- Live classes integration (Zoom/Google Meet).
- Discussion forums / Q&A per lesson.
- Coding playground (embedded IDE).
- Assignment submission and grading.
- Leaderboard and gamification (XP, badges).
- Referral program.
- Subscription/all-access pass model.
- Mobile app (React Native).
- Instructor payout system.
- Multi-language support.
