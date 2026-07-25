"use client";

/**
 * /auth-redirect
 * Intermediate page used as OAuth callbackUrl.
 * Reads the session role and immediately redirects to the correct dashboard.
 * This solves the problem of Google OAuth needing a static callbackUrl
 * while still routing users to their role-specific dashboard.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

function getDashboardPath(role?: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":      return "/admin";
    case "INSTRUCTOR": return "/instructor";
    case "MENTOR":     return "/mentor";
    case "MARKETING":  return "/marketing";
    case "SUPPORT":    return "/support";
    case "FINANCE":    return "/finance";
    default:           return "/dashboard";
  }
}

export default function AuthRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const role = (session?.user as any)?.role;
    router.replace(getDashboardPath(role));
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="text-[var(--color-brand)] animate-spin" />
        <p className="text-[0.84rem] text-[var(--color-fg-muted)]">Signing you in…</p>
      </div>
    </div>
  );
}
