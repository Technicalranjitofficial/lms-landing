import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { testBunnyConnection } from "@/lib/uploads/bunny";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role  = token?.role as string | undefined;

  if (!token || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await testBunnyConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
