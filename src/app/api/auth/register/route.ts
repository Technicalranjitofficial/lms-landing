import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api";

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Delegates to codepath-api for user creation + gets the verificationToken back,
// then fires the verification email from the Next.js side (SMTP lives here).

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    // ── Basic validation (backend also validates, this is for fast feedback) ──
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // ── Delegate to codepath-api ───────────────────────────────────────────────
    const backendRes = await fetch(`${API}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email, password }),
    });

    const backendData = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: backendData.message ?? "Registration failed" },
        { status: backendRes.status }
      );
    }

    // ── Send verification email using the token from the backend ──────────────
    const { verificationToken } = backendData;
    if (verificationToken) {
      sendVerificationEmail(email, name.trim(), verificationToken).catch((err) => {
        console.error("[REGISTER] Verification email failed:", err);
      });
    }

    return NextResponse.json(
      {
        message:
          "Account created. Please check your email to verify your account before signing in.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
