"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Loader2, Users, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { adminApi, formatDate, type AdminCourse } from "@/lib/adminApi";
import { CourseForm, type CoursePayload } from "@/components/dashboard/CourseForm";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: "badge-green",
  DRAFT:     "badge-amber",
  ARCHIVED:  "badge-violet",
};

export default function EditCoursePage() {
  const router   = useRouter();
  const params   = useParams<{ id: string }>();
  const courseId = params.id;

  const [course,  setCourse]  = useState<AdminCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminApi.get<AdminCourse>(`courses/${courseId}`);
        setCourse(data);
      } catch (e: unknown) {
        setError((e as Error).message ?? "Failed to load course");
      } finally {
        setLoading(false);
      }
    }
    if (courseId) void load();
  }, [courseId]);

  async function handleUpdate(payload: CoursePayload) {
    await adminApi.put<AdminCourse>(`courses/${courseId}`, payload);
    router.push("/admin/courses");
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[var(--color-brand-dim)] flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-[var(--color-brand)]" />
        </div>
        <p className="text-sm text-[var(--color-fg-muted)]">Loading course…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !course) {
    return (
      <div className="max-w-[500px] space-y-4">
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
        >
          <ArrowLeft size={14} /> Back to courses
        </Link>
        <div className="card p-8 text-center space-y-3">
          <p className="text-[var(--color-rose)] font-medium">{error ?? "Course not found"}</p>
          <Link href="/admin/courses" className="btn btn-outline text-sm">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] space-y-7">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div className="flex items-start gap-3">
          <Link
            href="/admin/courses"
            className="p-2 rounded-xl border border-[var(--color-border-2)] hover:border-[var(--color-border-brand)] hover:bg-[var(--color-brand-dim)] transition-all mt-0.5"
          >
            <ArrowLeft size={16} className="text-[var(--color-fg-muted)]" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-[var(--color-brand-light)]">
                Courses / Edit
              </span>
              <span className={cn("badge", STATUS_BADGE[course.status] ?? "badge-amber")}>
                {course.status}
              </span>
            </div>
            <h1 className="font-display font-black text-xl text-[var(--color-fg)] tracking-tight line-clamp-1">
              {course.title}
            </h1>
            {/* Course meta strip */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-[0.72rem] text-[var(--color-fg-subtle)]">
                Created {formatDate(course.createdAt)}
              </span>
              {course._count && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-fg-subtle)]" />
                  <span className="flex items-center gap-1 text-[0.72rem] text-[var(--color-fg-subtle)]">
                    <Users size={10} />
                    {course._count.enrollments} enrolled
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[var(--color-fg-subtle)]" />
                  <span className="flex items-center gap-1 text-[0.72rem] text-[var(--color-fg-subtle)]">
                    <Star size={10} />
                    {course._count.reviews} reviews
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="btn btn-outline text-sm gap-1.5"
          >
            <ExternalLink size={13} />
            View Live
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
        <CourseForm
          courseId={courseId}
          initialData={course}
          onSubmit={handleUpdate}
          submitLabel="Save Changes"
        />
      </motion.div>
    </div>
  );
}
