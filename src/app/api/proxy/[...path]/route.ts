/**
 * Generic backend proxy — /api/proxy/[...path]
 *
 * Forwards requests to codepath-api at whatever path is given.
 * Used for endpoints not under /admin/* prefix:
 *   /api/proxy/orders          → {API}/orders
 *   /api/proxy/coupons         → {API}/coupons
 *   /api/proxy/support/tickets → {API}/support/tickets
 *
 * Requires a valid admin session (ADMIN or SUPER_ADMIN).
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api";

type Params = { path: string[] };

async function handler(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = token.role as string | undefined;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { path } = await params;
  const upstreamPath = path.join("/");
  const search = req.nextUrl.search ?? "";
  const url = `${API}/${upstreamPath}${search}`;

  const backendToken = token.backendToken as string | null ?? null;
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
    console.error("[PROXY]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
