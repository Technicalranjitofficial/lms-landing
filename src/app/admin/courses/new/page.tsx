"use client";

import { motion } from "framer-motion";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi, type AdminCourse } from "@/lib/adminApi";
import { CourseForm, type CoursePayload } from "@/components/dashboard/CourseForm";

export default function NewCoursePage() {
  const router = useRouter();

  async function handleCreate(payload: CoursePayload) {
    const course = await adminApi.post<{ id: string }>("courses", payload);
    router.push("/admin/courses");
    return course;
  }

  return (
    <div className="max-w-[1200px] space-y-7">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="p-2 rounded-xl border border-[var(--color-border-2)] hover:border-[var(--color-border-brand)] hover:bg-[var(--color-brand-dim)] transition-all"
          >
            <ArrowLeft size={16} className="text-[var(--color-fg-muted)]" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-[var(--color-brand-light)]">
                Courses / New
              </span>
            </div>
            <h1 className="font-display font-black text-xl text-[var(--color-fg)] tracking-tight">
              Create New Course
            </h1>
            <p className="text-[var(--color-fg-muted)] text-sm mt-0.5">
              Fill in the steps below. You can save as draft and publish later.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/courses" className="btn btn-outline text-sm">
            Cancel
          </Link>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-brand)]/40 to-transparent" />

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <CourseForm onSubmit={handleCreate} submitLabel="Create Course" />      </motion.div>
    </div>
  );
}
