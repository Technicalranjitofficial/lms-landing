"use client";

import { useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

/**
 * Admin layout — always forces dark mode regardless of the user's
 * site-wide theme preference. The admin panel is dark-only by design.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force dark class + data-theme on html while inside admin
    const html = document.documentElement;
    const prevTheme  = html.getAttribute("data-theme");
    const hadDark    = html.classList.contains("dark");

    html.setAttribute("data-theme", "dark");
    html.classList.add("dark");

    return () => {
      // Restore previous state when navigating away from admin
      if (prevTheme) html.setAttribute("data-theme", prevTheme);
      else           html.removeAttribute("data-theme");
      if (!hadDark)  html.classList.remove("dark");
    };
  }, []);

  return <DashboardShell role="ADMIN">{children}</DashboardShell>;
}
