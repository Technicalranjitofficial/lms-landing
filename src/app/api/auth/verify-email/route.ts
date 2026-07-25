import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api";

// ─── GET /api/auth/verify-email?token=<uuid> ──────────────────────────────────
// Email link click — delegates to backend, then redirects.

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?error=missing_token", req.nextUrl.origin)
    );
  }

  const res = await fetch(`${API}/users/verify-email?token=${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.redirect(
      new URL("/verify-email?error=invalid_or_expired", req.nextUrl.origin)
    );
  }

  // Welcome email (fire-and-forget — we may not have the user's name here,
  // backend could return it in future; for now skip the welcome email on GET)
  void data;

  return NextResponse.redirect(new URL("/login?verified=1", req.nextUrl.origin));
}

// ─── POST /api/auth/verify-email ──────────────────────────────────────────────
// Programmatic call from the verify-email page's useEffect.

export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token?: string };

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${API}/users/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message ?? "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Send welcome email if backend returns user info
    if (data.user?.email && data.user?.name) {
      sendWelcomeEmail(data.user.email, data.user.name).catch(console.error);
    }

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("[VERIFY-EMAIL]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
