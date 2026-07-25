---
inclusion: auto
---

# Technology Stack — CodePath LMS

## Language & Runtime
- **TypeScript 5** — strict mode enabled.
- **Node.js 20** — latest LTS.
- Module resolution: bundler.

## Framework
- **Next.js 16** (App Router) — React Server Components by default.
- Standalone output for Docker deployment.
- Turbopack enabled for dev (default in Next.js 16).
- Build: `next build`

## UI & Styling
- **Tailwind CSS 4** — utility-first CSS. ALL styling MUST use Tailwind classes.
- **Framer Motion** — animations and transitions.
- **Lucide React** — icon set.
- **clsx** + **tailwind-merge** — conditional class merging via `cn()` utility.
- Custom CSS classes in `globals.css` for reusable patterns (`.btn`, `.card`, `.spotlight-card`, `.glass-card`, etc.).
- **next-themes** — dark/light mode toggle support.
- No component library (shadcn/ui, MUI, etc.) — all custom.

## Video Hosting & Streaming
- **Bunny Stream** (via Bunny.net) — video hosting, transcoding, and adaptive streaming.
  - HLS adaptive bitrate streaming.
  - Embed via iframe or Bunny Player SDK.
  - API for upload, manage, and retrieve video metadata.
  - Token-authenticated private videos for enrolled students.
  - Base URL: `https://video.bunnycdn.com`
  - Library API: `https://video.bunnycdn.com/library/{libraryId}`
  - Player embed: `https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}`

## Asset Storage (CDN)
- **Cloudflare R2** — object storage for images, PDFs, notes, and downloadable resources.
  - S3-compatible API (use `@aws-sdk/client-s3` with R2 endpoint).
  - Public bucket for course thumbnails, instructor avatars.
  - Private bucket with presigned URLs for premium notes/PDFs.
  - Custom domain: configure via Cloudflare dashboard.
  - No egress fees — ideal for serving large course assets.

## Payments
- **Razorpay** — payment gateway for course purchases.
  - Razorpay Checkout (standard integration) for one-time payments.
  - Razorpay Subscriptions API for recurring/EMI plans.
  - Webhook verification for payment confirmation.
  - `razorpay` npm package for server-side order creation.
  - Client-side: Razorpay Checkout.js script loaded dynamically.
  - Support: UPI, Cards, NetBanking, Wallets, EMI.

## Database & Backend (planned)
- **PostgreSQL** — primary database via Prisma ORM.
- **Prisma** — type-safe ORM for database access.
- **NextAuth.js / Auth.js** — authentication (email/password + OAuth).
- **Redis** (optional) — session cache, rate limiting, video progress caching.

## Fonts
- **Inter** — primary sans-serif (`--font-inter`, `--font-sans`).
- **Space Grotesk** — display/heading font (`--font-space-grotesk`, `--font-display`).

## Package Manager
- **npm** (package-lock.json present).

## Build & Deployment
- Build: `next build`
- Dev: `next dev`
- Production: `next start`
- Docker: standalone output configured.

## Path Aliases
```json
"@/*": ["./src/*"]
```

All imports use `@/` prefix rooted at `src/`.

## Key Dependencies (Current)
- `next` — framework
- `react` / `react-dom` — UI (React 19)
- `framer-motion` — animations
- `lucide-react` — icons
- `tailwind-merge` + `clsx` — class utilities
- `tailwindcss` — styling (v4)
- `next-themes` — theme switching

## Planned Dependencies
- `razorpay` — payment gateway (server-side)
- `@aws-sdk/client-s3` — Cloudflare R2 interaction
- `@prisma/client` + `prisma` — database ORM
- `next-auth` — authentication
- `react-player` or Bunny Player SDK — video playback
- `react-hook-form` + `zod` — form handling & validation
- `date-fns` — date formatting
- `sharp` — image optimization (already bundled with Next.js)
- `nodemailer` or Resend — transactional emails
- `stripe` (optional fallback) — alternative payment if needed

## Environment Variables (Expected)
```
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Bunny Stream
BUNNY_API_KEY=
BUNNY_LIBRARY_ID=
BUNNY_CDN_HOSTNAME=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_BUNNY_CDN_HOSTNAME=
```

## Design Tokens (defined in globals.css @theme)
- `--color-bg`: #0a0a0a (deep dark)
- `--color-bg-2`: #111111
- `--color-surface`: #161616
- `--color-surface-2`: #1c1c1c
- `--color-fg`: #f2f2f2
- `--color-fg-muted`: #888888
- `--color-brand`: #7c6fff (indigo-violet)
- `--color-brand-light`: #b4acff
- `--color-cyan`: #22d3ee
- `--color-border`: rgba(255,255,255,0.06)
