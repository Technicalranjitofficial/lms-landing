---
inclusion: auto
---

# CodePath LMS — Rules & Conventions

## Role & Goal
You are an expert Next.js + Tailwind CSS developer working on the CodePath LMS platform.
Output exact code changes. No unnecessary explanations unless asked.

## Stack
- **Framework:** Next.js 16 (App Router, standalone output)
- **Styling:** Tailwind CSS 4 (utility-first) — THE primary styling method
- **Animations:** Framer Motion (marketing pages), minimal in dashboard/admin
- **Icons:** Lucide React
- **Language:** TypeScript — strict mode
- **Database:** PostgreSQL via Prisma
- **Auth:** NextAuth.js (Auth.js)
- **Video:** Bunny Stream
- **Storage:** Cloudflare R2
- **Payments:** Razorpay
- **Forms:** react-hook-form + zod

---

## CRITICAL: Tailwind CSS Rules (MUST FOLLOW)

1. **ALWAYS use Tailwind utility classes** for all styling. Never use inline `style={{}}` objects.
2. **Convert existing inline styles to Tailwind** when modifying a component — do not add more inline styles.
3. **Use arbitrary values** when needed: `w-[700px]`, `bg-[rgba(108,99,255,0.1)]`, `text-[0.82rem]`.
4. **Use CSS variables via Tailwind**: `bg-[var(--color-brand)]`, `text-[var(--color-fg)]`.
5. **Responsive design** uses Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`.
6. **Hover/focus states** use Tailwind modifiers: `hover:`, `focus:`, `active:`.
7. **Use `cn()` from `@/lib/utils`** for conditional classes: `cn(base, conditional && 'class')`.
8. **globals.css utility classes** (`.btn`, `.card`, `.spotlight-card`, `.glass-card`, etc.) are acceptable.
9. **Do NOT write new CSS** in globals.css unless it genuinely cannot be expressed with Tailwind.
10. **Do NOT use CSS modules** — not part of this project's architecture.

### Allowed Exceptions (inline style OK)
- Framer Motion `style` prop for animated values (`motion.div style={{ opacity, x, y }}`).
- Dynamic values computed at runtime that cannot be expressed as static Tailwind classes.
- CSS custom property injection for spotlight effects (`--mx`, `--my`).

---

## Architecture Rules

### Component Organization
1. **Marketing components** → `src/components/marketing/` — animation-heavy, visual.
2. **Course components** → `src/components/course/` — course-specific UI.
3. **Player components** → `src/components/player/` — video player and related.
4. **Checkout components** → `src/components/checkout/` — payment flow UI.
5. **Dashboard components** → `src/components/dashboard/` — student dashboard UI.
6. **Admin components** → `src/components/admin/` — admin panel UI.
7. **Shared UI primitives** → `src/components/ui/` — Button, Input, Modal, etc.

### Client vs Server Components
- **Server Components by default** — use for data fetching pages, layouts.
- **`"use client"` only when needed** — interactivity, hooks, browser APIs, Framer Motion.
- Marketing section components → `"use client"` (animations).
- Dashboard pages → Server Component for data fetch, client components for interaction.
- API route handlers → always server-side.

### Data Fetching
- **Server Components**: Fetch data directly with Prisma in page components.
- **Client Components**: Use fetch to API route handlers (`/api/...`).
- **No `getServerSideProps`** — use async Server Components or Route Handlers.
- **Cache strategy**: Use `unstable_cache` or `revalidatePath` for ISR patterns.

---

## File Conventions

| Type | Path | Naming |
|------|------|--------|
| Pages | `src/app/<route>/page.tsx` | kebab-case routes |
| Layouts | `src/app/<route>/layout.tsx` | per-section layouts |
| Components | `src/components/<group>/<Name>.tsx` | PascalCase |
| Lib/Services | `src/lib/<name>.ts` | camelCase |
| Hooks | `src/hooks/use<Name>.ts` | camelCase with `use` prefix |
| Types | `src/types/<name>.ts` | camelCase |
| API Routes | `src/app/api/<resource>/route.ts` | kebab-case |
| Global styles | `src/app/globals.css` | Single file |
| Prisma schema | `prisma/schema.prisma` | Standard |

---

## API Route Handler Conventions

```typescript
// Standard pattern for API routes
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ... logic
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API_ROUTE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### API Response Format
```typescript
// Success
{ data: T, message?: string }

// Error
{ error: string, details?: unknown }

// Paginated
{ data: T[], total: number, page: number, pageSize: number }
```

---

## Database Conventions (Prisma)

- Model names: PascalCase singular (`Course`, `User`, `Enrollment`).
- Field names: camelCase (`createdAt`, `courseId`, `thumbnailUrl`).
- Relations: explicit foreign keys with `@relation`.
- Soft deletes: `deletedAt DateTime?` field where needed.
- Timestamps: always include `createdAt` and `updatedAt`.
- Enums: PascalCase values (`PUBLISHED`, `DRAFT`, `ARCHIVED`).

```prisma
model Course {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?  @db.Text
  price       Int      // Store in paise (smallest currency unit)
  status      CourseStatus @default(DRAFT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Payment Conventions (Razorpay)

- **Store prices in paise** (₹14,999 = 1499900 paise) in the database.
- **Display prices formatted**: Use `formatPrice()` utility for display.
- **Razorpay order creation** happens server-side only.
- **Payment verification** uses HMAC SHA256 signature check.
- **Webhook handler** must be idempotent (check if order already processed).
- **Never expose** `RAZORPAY_KEY_SECRET` to the client.

```typescript
// Price formatting utility
export function formatPrice(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
```

---

## Video Conventions (Bunny Stream)

- **Embed via iframe** with token authentication for enrolled students.
- **Never expose** raw video URLs to unenrolled users.
- **Progress tracking**: Listen to player events, save progress to API.
- **Thumbnail URLs**: Use Bunny CDN thumbnail endpoint.
- **Upload**: Admin uploads video → API creates Bunny video → returns embed ID.

```typescript
// Bunny Stream embed URL pattern
const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&autoplay=false`;
```

---

## Storage Conventions (Cloudflare R2)

- **Public assets** (thumbnails, instructor avatars): Serve via public R2 URL.
- **Private assets** (notes, PDFs): Generate presigned URLs with expiry.
- **Upload pattern**: Client gets presigned upload URL → uploads directly to R2.
- **File naming**: `{type}/{courseId}/{filename}` (e.g., `thumbnails/abc123/cover.webp`).
- **Allowed types**: Images (jpg, png, webp), Documents (pdf), Videos uploaded to Bunny separately.

---

## Authentication Conventions

- Use NextAuth.js with Credentials provider (email/password) + OAuth (Google).
- Passwords hashed with bcrypt.
- Session strategy: JWT (stateless, good for serverless).
- Middleware protects `/dashboard/*` and `/admin/*` routes.
- Role field on User model: `STUDENT`, `INSTRUCTOR`, `ADMIN`.

---

## Form Conventions

```typescript
// Standard form pattern
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3).max(120),
  price: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

function CourseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  // ...
}
```

---

## Design System

### Marketing Pages (Animation-Heavy)
- Dark theme primary (deep navy/black backgrounds).
- Brand color: `#7c6fff` (indigo-violet).
- Accent: `#22d3ee` (cyan).
- Glassmorphism effects (backdrop-blur, semi-transparent backgrounds).
- Space Grotesk for headings, Inter for body.
- Spotlight cards, shimmer borders, animated counters.
- Smooth Framer Motion transitions on all interactive elements.
- Noise overlay texture.

### Dashboard/Admin Pages (Functional-First)
- Clean, minimal UI — less animation, more utility.
- Card-based layout with clear hierarchy.
- Data tables with sorting, filtering, pagination.
- Form-heavy — clear labels, validation feedback, loading states.
- Sidebar navigation (collapsible on mobile).
- Toast notifications for actions.
- Skeleton loaders for data fetching.
- Same color tokens but applied more conservatively.

---

## Animation Rules

### Marketing Pages
- Use Framer Motion for entrance/scroll animations.
- Spotlight card mouse-follow effect.
- Shimmer borders on featured content.
- Animated stat counters with `useSpring`.
- Respect `prefers-reduced-motion`.
- Keep animations subtle — no jarring movements.

### Dashboard/Admin Pages
- Minimal animations — only meaningful transitions.
- Page transitions: simple `opacity` fade.
- List items: subtle `y` slide on mount.
- Modals: scale + opacity spring.
- Avoid scroll-triggered animations in functional pages.

---

## Performance Rules

- Lazy-load heavy components (video player, rich text editor, charts).
- Use `dynamic(() => import(...), { ssr: false })` for client-only components.
- Images use Next.js `<Image>` with proper `sizes` and `priority` for LCP.
- Minimize layout shift — set explicit dimensions on images/videos.
- Use React `Suspense` + loading states for data fetching.
- Paginate long lists — never render 100+ items at once.
- Debounce search inputs (300ms).
- Presigned URL uploads bypass server for large files.

---

## Security Rules

- Validate all API inputs with Zod on the server.
- Check authentication AND authorization on every protected route.
- Verify Razorpay payment signatures server-side before enrolling.
- Use presigned URLs with short expiry for private content.
- Sanitize user-generated content (reviews, descriptions).
- Rate limit sensitive endpoints (login, payment, upload).
- Never log sensitive data (passwords, payment details, tokens).
- CSRF protection via NextAuth.js built-in mechanisms.

---

## SEO Rules

- Maintain structured data (Course, Organization schemas) on public pages.
- All images need descriptive `alt` attributes.
- Semantic HTML (proper heading hierarchy, landmarks, `<main>`, `<nav>`).
- Course pages: unique title, description, canonical URL.
- Dynamic OG images for course sharing (future).
- Sitemap generation for public pages.

---

## Error Handling

```typescript
// Client-side: Toast notification for user-facing errors
toast.error("Payment failed. Please try again.");

// Server-side: Structured error logging
console.error("[PAYMENT_VERIFY]", { orderId, error: error.message });

// API routes: Always return proper HTTP status codes
// 200 — success
// 201 — created
// 400 — bad request (validation error)
// 401 — unauthorized
// 403 — forbidden (wrong role)
// 404 — not found
// 409 — conflict (already enrolled)
// 500 — internal error
```

---

## What NOT to Do

- Do NOT use inline `style={{}}` for layout, spacing, colors, typography — use Tailwind.
- Do NOT add CSS modules.
- Do NOT add shadcn/ui, MUI, or any component library.
- Do NOT expose API keys or secrets to the client.
- Do NOT store prices as floats — use integers (paise).
- Do NOT render video URLs for unenrolled users.
- Do NOT skip authentication checks on protected API routes.
- Do NOT use `console.log` in production code — use proper error handling.
- Do NOT fetch data on the client when Server Components can do it.
- Do NOT create new CSS custom properties unless absolutely necessary.
- Do NOT use `any` type — always type properly.
- Do NOT skip form validation on the server (client validation is for UX only).
