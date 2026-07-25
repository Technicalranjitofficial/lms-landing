/**
 * Student API Proxy — /api/student/[...path]
 *
 * Forwards requests to the backend for authenticated students (any role).
 * Used for: enrollments, lesson progress, my courses, reviews.
 *
 * Unlike /api/proxy/[...path] (admin-only), this allows any logged-in user.
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api";

type Params = { path: string[] };

async function handler(req: NextRequest, { params }: { params: Promise<Params> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 });
  }

  const { path } = await params;
  const upstreamPath = path.join("/");
  const search = req.nextUrl.search ?? "";
  const url = `${API}/${upstreamPath}${search}`;

  const backendToken = (token.backendToken as string | null) ?? null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (backendToken) headers["Authorization"] = `Bearer ${backendToken}`;

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text();
    if (body) init.body = body;
  }

  try {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[STUDENT PROXY]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
