import type { DefaultSession, DefaultJWT } from "next-auth";

// All platform roles
export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "INSTRUCTOR"
  | "MENTOR"
  | "MARKETING"
  | "SUPPORT"
  | "FINANCE"
  | "STUDENT";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      provider: "credentials" | "google";
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    provider?: "credentials" | "google";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    provider?: string;
    lastSync?: number;
  }
}
