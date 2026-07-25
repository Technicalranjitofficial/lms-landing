# CodePath LMS — Retrospective Spec

> **Document Purpose**: Documents what has been built, architecture decisions made, current state of the codebase, and technical debt.
>
> **Last Updated**: July 2026

---

## 1. Project Overview

**CodePath** is a Learning Management System (LMS) for an online coding education platform targeting Indian college students, career switchers, and working developers. The platform offers paid video courses covering DSA, Full Stack Development, System Design, AI/ML, DevOps, and Mobile Development.

**Current State**: Phase 0 (Marketing Landing + Course Catalog) is complete. The frontend is fully functional with a marketing landing page, course listing page, individual course detail pages, authentication hooks, and an API client — all connected to an external backend at `localhost:4002`.

---

## 2. Technology Stack (Implemented)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.11 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | v4 |
| PostCSS | @tailwindcss/postcss | ^4 |
| Animations | Framer Motion | ^12.42.2 |
| Icons | Lucide React | ^1.26.0 |
| Theme | next-themes | ^0.4.6 |
| Class Utils | clsx + tailwind-merge | ^2.1.1 / ^3.6.0 |
| Package Manager | npm | — |
| Output | Standalone (Docker-ready) | — |

### Not Yet Installed (Planned)
- Prisma, PostgreSQL, NextAuth, Razorpay SDK, @aws-sdk/client-s3, react-hook-form, zod, date-fns, nodemailer/Resend

---

## 3. Architecture

### 3.1 Folder Structure (Current)

```
lms-landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout — fonts, ThemeProvider, AuthProvider
│   │   ├── page.tsx            # Homepage (marketing landing)
│   │   ├── globals.css         # Full design system + component classes
│   │   └── courses/
│   │       ├── page.tsx        # Course catalog (search, filter, sort)
│   │       └── [slug]/
│   │           └── page.tsx    # Course detail (curriculum, reviews, pricing)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Stats.tsx
│   │   ├── Courses.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Placements.tsx
│   │   ├── Testimonials.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTA.tsx
│   │   ├── Footer.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── hooks/
│   │   ├── useAuth.ts          # Login, register, logout, localStorage token
│   │   └── useCourses.ts       # Fetch courses, course detail, reviews
│   └── lib/
│       ├── api.ts              # Full typed API client (courses, auth, enrollments)
│       └── utils.ts            # cn() utility
├── public/                     # Static assets
├── .env                        # NEXT_PUBLIC_API_URL
├── next.config.ts              # Standalone + Unsplash remote images
├── postcss.config.mjs          # @tailwindcss/postcss
├── tsconfig.json
└── package.json
```

### 3.2 Page Composition

**Homepage (`/`)** renders sections in order:
```
Navbar → Hero → Stats → Courses → HowItWorks → Placements → Testimonials → FAQ → CTA → Footer
```

**Course Catalog (`/courses`)** — full-page with category filter tabs, search, level filter, sort options, and a paginated/scrollable grid of course cards. Falls back to static data if API is unavailable.

**Course Detail (`/courses/[slug]`)** — hero banner, key stats, "What You'll Learn" section, curriculum accordion, instructor card, student reviews, pricing sidebar (desktop) / bottom bar (mobile), and related courses.

### 3.3 Data Flow

```
┌──────────────────────────────────────────────┐
│  Frontend (Next.js 16)                        │
│                                               │
│  pages/components → hooks → lib/api.ts        │
│                                               │
│  Token stored in localStorage                 │
│  Auth state in React Context (AuthProvider)   │
└──────────────────┬───────────────────────────┘
                   │ HTTP (fetch)
                   ▼
┌──────────────────────────────────────────────┐
│  Backend API (localhost:4002)                  │
│  (codepath-api — separate repo)               │
│                                               │
│  Endpoints:                                   │
│  - GET  /api/public/courses                   │
│  - GET  /api/public/courses/:slug             │
│  - GET  /api/public/courses/:slug/reviews     │
│  - POST /api/public/inquiries                 │
│  - POST /api/users/register                   │
│  - POST /api/users/login                      │
│  - GET  /api/users/profile                    │
│  - POST /api/users/reviews                    │
│  - GET  /api/enrollments/mine                 │
│  - POST /api/enrollments                      │
│  - GET  /api/enrollments/check/:courseId       │
└──────────────────────────────────────────────┘
```

---

## 4. Design System

### 4.1 Theming
- **Dark mode** (default) + **Light mode** via `next-themes` with `data-theme` attribute.
- Theme toggle in Navbar.
- All color tokens defined in `globals.css` `@theme inline {}` with light mode overrides in `[data-theme="light"]`.

### 4.2 Color Palette

| Token | Dark | Light |
|-------|------|-------|
| `--color-bg` | `#0a0a0a` | `#fafafe` |
| `--color-surface` | `#161616` | `#ffffff` |
| `--color-fg` | `#f2f2f2` | `#0c0c1e` |
| `--color-brand` | `#7c6fff` | `#5b52d6` |
| `--color-cyan` | `#22d3ee` | `#22d3ee` |
| `--color-border` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.07)` |

### 4.3 Typography
- **Inter** — body text (`--font-sans`)
- **Space Grotesk** — headings/display (`--font-display`)

### 4.4 Reusable CSS Classes (in `globals.css @layer components`)
- Layout: `.container`, `.section`, `.page-wrap`
- Typography: `.section-label`, `.section-title`, `.section-sub`, `.text-grad`, `.text-shimmer`
- Cards: `.card`, `.card-2`, `.glass-card`, `.spotlight-card`, `.shimmer-border`, `.grad-card`
- Buttons: `.btn`, `.btn-brand`, `.btn-outline`, `.btn-ghost`
- Badges: `.badge`, `.badge-green`, `.badge-cyan`, `.badge-violet`, etc.
- Form: `.input`
- Misc: `.tag`, `.divider`, `.divider-grad`, `.progress-bar`, `.noise-overlay`, `.mesh-bg`

### 4.5 Signature Visual Effects
- **Spotlight cards** — radial gradient follows cursor (`--mx`, `--my` CSS vars)
- **Shimmer borders** — animated gradient border on featured content
- **Noise overlay** — subtle SVG noise texture over entire page
- **Mesh background** — layered radial gradients for depth
- **Animated counters** — `useSpring` from Framer Motion for stat numbers

---

## 5. Component Inventory

| Component | Type | Description |
|-----------|------|-------------|
| `Navbar.tsx` | Client | Fixed header, mobile hamburger, theme toggle, auth state |
| `Hero.tsx` | Client | Animated hero with parallax, aurora glow, trust badges, tech pills |
| `Stats.tsx` | Client | Animated counter section (students, rating, lectures, placement rate) |
| `Courses.tsx` | Client | Featured course showcase + category filter grid |
| `HowItWorks.tsx` | Client | 4-step process visualization with connector animations |
| `Placements.tsx` | Client | Company logos marquee with placement stats |
| `Testimonials.tsx` | Client | Student success story cards with ratings |
| `FAQ.tsx` | Client | Expandable accordion with categorized questions |
| `CTA.tsx` | Client | Final call-to-action with animated background |
| `Footer.tsx` | Client | Navigation links, social, newsletter, copyright |
| `ThemeProvider.tsx` | Client | React Context for dark/light mode with localStorage persistence |
| `AuthProvider.tsx` | Client | React Context for auth state (user, login, register, logout) |

---

## 6. Key Decisions Made

### 6.1 Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| External API (separate backend repo) | Separation of concerns — frontend is purely presentational, backend handles business logic, auth, DB |
| localStorage for auth tokens | Simple client-side auth without server-side sessions; JWT-based |
| Static data fallback in course pages | Courses page works even without the backend running (graceful degradation) |
| Standalone Next.js output | Docker-ready deployment |
| All components are client-side | Heavy use of Framer Motion animations requires `"use client"` |
| No API routes in frontend | All API logic lives in the separate codepath-api |

### 6.2 Styling Decisions

| Decision | Rationale |
|----------|-----------|
| Tailwind CSS v4 with @layer components | Organized design system where utilities can override component classes |
| Custom globals.css classes (not a UI lib) | Full control over design; no third-party component library dependencies |
| CSS variables for all colors | Enables dark/light theming with a single attribute toggle |
| Spotlight effect via CSS vars | Performant mouse-tracking effect without JavaScript re-renders |

### 6.3 UX Decisions

| Decision | Rationale |
|----------|-----------|
| Dark theme default | Target audience (developers/students) prefers dark mode |
| Mobile-first responsive | Large portion of Indian student users on mobile devices |
| Noise overlay + mesh gradients | Premium visual feel that differentiates from typical edtech platforms |
| Animated counters + shimmer | Creates perceived value and engagement on marketing page |

---

## 7. Technical Debt & Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Course data hardcoded in page components | Medium | `/courses` and `/courses/[slug]` have large static arrays as fallback — should be fetched from API exclusively once backend is stable |
| No error boundaries | Low | App will crash on unhandled runtime errors |
| No loading/skeleton states on pages | Low | Pages show nothing until data loads (no Suspense boundaries) |
| Auth uses localStorage only | Medium | Vulnerable to XSS; should migrate to httpOnly cookies when backend supports it |
| No middleware for route protection | Medium | Dashboard/admin routes (when built) need middleware-level auth checks |
| No image optimization strategy | Low | Using Unsplash URLs directly — should move to R2 + Next.js Image optimization |
| Components not organized in subdirectories | Low | All 12 components in flat `src/components/` — planned structure has `marketing/`, `course/`, `ui/` etc. |
| No test coverage | Medium | Zero tests — no unit, integration, or e2e tests |
| No CI/CD pipeline | Low | No GitHub Actions or deployment automation |
| `next-themes` + `data-theme` dual approach | Low | Slight redundancy — could simplify to one theming mechanism |

---

## 8. Performance Characteristics

- **First Contentful Paint**: Fast — minimal server-side data fetching, mostly static content
- **Largest Contentful Paint**: Hero section with Unsplash images (external, not optimized)
- **Bundle Size**: Reasonable — Framer Motion is the heaviest dep (~30KB gzipped)
- **Mobile Performance**: Good — no Three.js or heavy 3D unlike xyzbuilder
- **API Dependency**: Graceful — pages work with static fallback data if API is down

---

## 9. Environment & Configuration

### Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:4002/api
```

### next.config.ts
- `output: "standalone"` — Docker deployment ready
- `images.remotePatterns` — allows Unsplash images

### postcss.config.mjs
- `@tailwindcss/postcss` plugin only (Tailwind v4 pattern)

---

## 10. What's Working Well

1. **Design system is cohesive** — consistent tokens, reusable classes, dark/light theme support
2. **Component composition is clean** — page.tsx simply composes sections in order
3. **API client is well-typed** — full TypeScript types for all API contracts
4. **Auth/enrollment hooks are production-ready** — proper error handling, loading states
5. **Course detail page is feature-rich** — curriculum, reviews, instructor, pricing all in one page
6. **Responsive design is solid** — mobile-first with proper breakpoints throughout
7. **Visual quality is high** — spotlight effects, shimmer borders, and animations create premium feel
