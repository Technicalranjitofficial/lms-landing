"use client";

/**
 * useCourseDraft — localStorage draft persistence for the CourseForm.
 *
 * Strategy:
 *   - NEW course  : key = "course-draft-new"
 *     Auto-saves to localStorage every time the snapshot changes (debounced).
 *     On mount, returns any saved draft so the form can restore it.
 *     Clears when saved to DB or explicitly discarded.
 *
 *   - EDIT course : key = "course-draft-{id}"
 *     Same behaviour but keyed by course id — protects unsaved edits.
 *     DB is always the source of truth on initial load (handled by edit page).
 *
 * The hook does NOT know about React state — the form manages its own state
 * and calls `save(snapshot)` whenever anything changes. The hook handles
 * debouncing, timestamps, and serialization.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { CourseModule } from "@/components/dashboard/CurriculumBuilder";

// ─── Draft shape — mirrors CoursePayload but all fields optional ──────────────

export interface CourseDraftData {
  title?:           string;
  subtitle?:        string;
  description?:     string;
  longDescription?: string;
  category?:        string;
  level?:           string;
  duration?:        string;
  priceRupees?:     string;
  origRupees?:      string;
  thumbnail?:       string;
  previewVideoId?:  string;
  instructorId?:    string;
  status?:          "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured?:        boolean;
  tag?:             string;
  accentColor?:     string;
  gradient?:        string;
  tags?:            string[];
  highlights?:      string[];
  whatYouLearn?:    string[];
  prerequisites?:   string[];
  totalLectures?:   number;
  totalHours?:      number;
  modules?:         number;
  projects?:        number;
  curriculum?:      CourseModule[];
  step?:            number;   // which step the user was on
  // metadata
  savedAt?:         number;   // unix ms
  dbCourseId?:      string;   // set after first DB save (new → edit redirect)
}

interface StoredDraft {
  data:    CourseDraftData;
  savedAt: number;
}

function storageKey(courseId?: string): string {
  return courseId ? `course-draft-${courseId}` : "course-draft-new";
}

function readDraft(courseId?: string): StoredDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(courseId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredDraft;
  } catch {
    return null;
  }
}

function writeDraft(courseId: string | undefined, data: CourseDraftData) {
  if (typeof window === "undefined") return;
  try {
    const stored: StoredDraft = { data, savedAt: Date.now() };
    localStorage.setItem(storageKey(courseId), JSON.stringify(stored));
  } catch {
    // Quota exceeded — silently ignore
  }
}

function clearDraft(courseId?: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(courseId));
    // Also clear the generic "new" key when saving an edit
    if (courseId) localStorage.removeItem("course-draft-new");
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCourseDraftReturn {
  /** Call on mount to get saved draft (undefined = nothing saved) */
  loadDraft:    () => CourseDraftData | null;
  /** Call whenever form state changes — debounced 800ms internally */
  saveDraft:    (data: CourseDraftData) => void;
  /** Call after successful DB save or user clicks "Discard" */
  clearDraft:   () => void;
  /** How many seconds ago the draft was last saved (null = never) */
  savedSecsAgo: number | null;
  /** Whether a draft exists in localStorage */
  hasDraft:     boolean;
}

export function useCourseDraft(courseId?: string): UseCourseDraftReturn {
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedAt,   setSavedAt]   = useState<number | null>(() => {
    const stored = readDraft(courseId);
    return stored?.savedAt ?? null;
  });
  const [hasDraft,  setHasDraft]  = useState<boolean>(() => {
    return !!readDraft(courseId);
  });
  const [tick,      setTick]      = useState(0);

  // Tick every 10s to refresh "X seconds ago" display
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(interval);
  }, []);

  const saveDraft = useCallback((data: CourseDraftData) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      writeDraft(courseId, data);
      const now = Date.now();
      setSavedAt(now);
      setHasDraft(true);
    }, 800);
  }, [courseId]);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    clearDraft(courseId);
    setSavedAt(null);
    setHasDraft(false);
  }, [courseId]);

  const loadDraft = useCallback((): CourseDraftData | null => {
    const stored = readDraft(courseId);
    return stored?.data ?? null;
  }, [courseId]);

  const savedSecsAgo = savedAt
    ? Math.floor((Date.now() - savedAt) / 1000)
    : null;

  return { loadDraft, saveDraft, clearDraft: clear, savedSecsAgo, hasDraft };
}
