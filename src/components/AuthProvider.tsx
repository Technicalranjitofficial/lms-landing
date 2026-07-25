"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { createContext, useContext, useCallback, type ReactNode } from "react";
import type { Session } from "next-auth";
import type { UserRole } from "@/types/next-auth";

// ─── Extended session user type ───────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  provider: "credentials" | "google";
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInstructor: boolean;
  isMentor: boolean;
  isMarketing: boolean;
  isSupport: boolean;
  isFinance: boolean;
  isStudent: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  isInstructor: false,
  isMentor: false,
  isMarketing: false,
  isSupport: false,
  isFinance: false,
  isStudent: false,
  logout: async () => {},
});

// ─── Inner consumer — reads NextAuth session ──────────────────────────────────
function AuthContextBridge({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const user: AuthUser | null = session?.user
    ? {
        id:       (session.user as AuthUser).id       ?? "",
        name:     session.user.name                    ?? "",
        email:    session.user.email                   ?? "",
        image:    session.user.image,
        role:     (session.user as AuthUser).role      ?? "STUDENT",
        provider: (session.user as AuthUser).provider  ?? "credentials",
      }
    : null;

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("codepath_token");
      localStorage.removeItem("codepath_user");
    }
    await signOut({ callbackUrl: "/" });
  }, []);

  const role = user?.role;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        isSuperAdmin:  role === "SUPER_ADMIN",
        isAdmin:       role === "SUPER_ADMIN" || role === "ADMIN",
        isInstructor:  role === "INSTRUCTOR",
        isMentor:      role === "MENTOR",
        isMarketing:   role === "MARKETING",
        isSupport:     role === "SUPPORT",
        isFinance:     role === "FINANCE",
        isStudent:     role === "STUDENT",
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Public provider — wraps NextAuth SessionProvider ────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextBridge>{children}</AuthContextBridge>
    </SessionProvider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuthContext() {
  return useContext(AuthContext);
}
