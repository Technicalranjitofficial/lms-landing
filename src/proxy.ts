import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types/next-auth";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = (token?.role as UserRole | undefined) ?? "STUDENT";

    // ── /admin → SUPER_ADMIN and ADMIN only ──────────────────────────────────
    if (pathname.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── /instructor → INSTRUCTOR only ────────────────────────────────────────
    if (pathname.startsWith("/instructor")) {
      if (role !== "INSTRUCTOR") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── /mentor → MENTOR only ─────────────────────────────────────────────────
    if (pathname.startsWith("/mentor")) {
      if (role !== "MENTOR") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── /marketing → MARKETING only ──────────────────────────────────────────
    if (pathname.startsWith("/marketing")) {
      if (role !== "MARKETING") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── /support → SUPPORT only ───────────────────────────────────────────────
    if (pathname.startsWith("/support")) {
      if (role !== "SUPPORT") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── /finance → FINANCE only ───────────────────────────────────────────────
    if (pathname.startsWith("/finance")) {
      if (role !== "FINANCE") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // ── /dashboard → any authenticated user (all roles) ──────────────────────
    // Falls through — authorized callback below already ensures a valid token.

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true → middleware function runs (which does the role check).
      // Return false → NextAuth redirects to signIn page automatically.
      authorized: ({ token }) => !!token,
    },
  }
);

// Routes that require authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/instructor/:path*",
    "/mentor/:path*",
    "/marketing/:path*",
    "/support/:path*",
    "/finance/:path*",
  ],
};
