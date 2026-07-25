"use client";

import { useState, useEffect, useCallback } from "react";
import { userApi, enrollmentApi, type User, type Enrollment, ApiError } from "@/lib/api";

const TOKEN_KEY = "codepath_token";
const USER_KEY = "codepath_user";

// ─── Hook: Authentication ───

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // Invalid stored data
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { token, user: userData } = await userApi.login({ email, password });
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      setError(null);
      try {
        const { token, user: userData } = await userApi.register(data);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
        return userData;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Registration failed";
        setError(message);
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return { user, loading, error, login, register, logout, isAuthenticated };
}

// ─── Hook: Enrollments ───

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enrollmentApi.getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  }, []);

  const enroll = useCallback(
    async (courseId: string, paymentData?: { paymentId?: string; paymentMethod?: string; amountPaid?: number }) => {
      setError(null);
      try {
        const enrollment = await enrollmentApi.enroll({
          courseId,
          ...paymentData,
        });
        setEnrollments((prev) => [enrollment, ...prev]);
        return enrollment;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Enrollment failed";
        setError(message);
        throw err;
      }
    },
    []
  );

  const checkEnrollment = useCallback(async (courseId: string) => {
    try {
      return await enrollmentApi.checkEnrollment(courseId);
    } catch {
      return { enrolled: false, enrollment: null };
    }
  }, []);

  return { enrollments, loading, error, fetchEnrollments, enroll, checkEnrollment };
}
