"use client";

import { useState, useEffect, useCallback } from "react";
import { publicApi, type Course, type ReviewsResponse, ApiError } from "@/lib/api";

// ─── Hook: Fetch all courses ───

export function useCourses(params?: {
  category?: string;
  level?: string;
  featured?: string;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicApi.getCourses(params);
      setCourses(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to fetch courses");
      }
    } finally {
      setLoading(false);
    }
  }, [params?.category, params?.level, params?.featured]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
}

// ─── Hook: Fetch single course detail ───

export function useCourseDetail(slug: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    publicApi
      .getCourseBySlug(slug)
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to fetch course");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { course, loading, error };
}

// ─── Hook: Fetch course reviews ───

export function useCourseReviews(slug: string, page = 1, limit = 10) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const result = await publicApi.getCourseReviews(slug, page, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, [slug, page, limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { data, loading, error, refetch: fetchReviews };
}
