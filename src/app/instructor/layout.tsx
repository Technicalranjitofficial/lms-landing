"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="INSTRUCTOR">{children}</DashboardShell>;
}
