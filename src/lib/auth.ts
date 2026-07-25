import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { UserRole } from "@/types/next-auth";

// ─── Backend API base (server-side — no NEXT_PUBLIC_ prefix needed here) ─────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api";

// ─── Backend API helpers ──────────────────────────────────────────────────────

/**
 * Calls POST /api/users/google-auth — find-or-create for OAuth users.
 * Returns { token, user } on success, throws on failure.
 */
async function backendGoogleAuth(payload: {
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
}) {
  const res = await fetch(`${API}/users/google-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Backend google-auth failed: ${res.status}`);
  }
  return res.json() as Promise<{ token: string; user: { id: string; role: string; name: string; email: string; avatar?: string } }>;
}

/**
 * Calls POST /api/users/login — email + password auth.
 * Returns { token, user } on success, throws on failure.
 */
async function backendLogin(email: string, password: string) {
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Login failed");
  }
  return res.json() as Promise<{ token: string; user: { id: string; role: string; name: string; email: string; avatar?: string } }>;
}

/**
 * Calls GET /api/users/profile — refresh user data from DB.
 * Used in the 24h JWT sync to pick up role changes.
 */
async function backendGetProfile(jwtToken: string) {
  const res = await fetch(`${API}/users/profile`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; role: string; name: string; email: string; avatar?: string }>;
}

// ─── NextAuth config ──────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days

  pages: {
    signIn:  "/login",
    error:   "/login",
    newUser: "/register",
  },

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID  ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt:        "consent",
          access_type:   "offline",
          response_type: "code",
        },
      },
    }),

    // ── Email / Password ──────────────────────────────────────────────────────
    CredentialsProvider({
      id:   "credentials",
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Delegate to codepath-api — all auth logic lives there
        const { user, token } = await backendLogin(
          credentials.email,
          credentials.password,
        );

        // Log role in dev to confirm the backend is returning the correct value
        if (process.env.NODE_ENV === "development") {
          console.log(`[NextAuth] Login: ${user.email} → role: ${user.role}`);
        }

        return {
          id:          user.id,
          email:       user.email,
          name:        user.name,
          image:       user.avatar ?? null,
          role:        user.role,
          backendToken: token, // stored in JWT for profile refresh calls
        } as User & { role: string; backendToken: string };
      },
    }),
  ],

  callbacks: {
    // ── Google: find-or-create user in MongoDB via codepath-api ───────────────
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { user: dbUser, token } = await backendGoogleAuth({
            email:    user.email!,
            name:     user.name  ?? "Google User",
            avatar:   user.image ?? undefined,
            googleId: account.providerAccountId,
          });

          // Stamp real MongoDB id + role + backendToken onto the NextAuth user object
          // These are picked up by the jwt callback below
          user.id    = dbUser.id;
          (user as any).role         = dbUser.role;
          (user as any).backendToken = token;

          if (process.env.NODE_ENV === "development") {
            console.log(`[NextAuth] Google sign-in: ${dbUser.email} → role: ${dbUser.role}`);
          }
        } catch (err) {
          console.error("[NextAuth] Google sign-in backend call failed:", err);
          // Surface the real error message instead of a generic AccessDenied
          const msg = err instanceof Error ? err.message : "Backend unavailable";
          // If the API is down, throw a credentials error so NextAuth shows
          // the error page with a descriptive message rather than AccessDenied
          throw new Error(msg);
        }
      }
      return true;
    },

    // ── Persist fields into the JWT ───────────────────────────────────────────
    async jwt({ token, user, account }) {
      // Initial sign-in — user object is populated, backendToken is fresh
      if (user) {
        token.id           = user.id;
        token.provider     = account?.provider          ?? "credentials";
        token.name         = user.name;
        token.email        = user.email;
        token.picture      = user.image;
        token.backendToken = (user as any).backendToken ?? null;
        token.lastSync     = Math.floor(Date.now() / 1000);

        // The role from backendLogin/googleAuth is already fresh from the DB.
        // No extra round-trip needed on sign-in — trust it directly.
        token.role = (user as any).role ?? "STUDENT";

        if (process.env.NODE_ENV === "development") {
          console.log(`[NextAuth] JWT created: ${token.email} → role in token: ${token.role}`);
        }
      }

      // Refresh from DB once every 1 hour for existing sessions — picks up
      // role changes without requiring the user to sign out and back in.
      const oneHourInSeconds = 60 * 60;
      const lastSync = (token.lastSync as number) ?? 0;
      const isDue = Math.floor(Date.now() / 1000) - lastSync > oneHourInSeconds;

      if (token.backendToken && isDue && !user) {
        const profile = await backendGetProfile(token.backendToken as string);
        if (profile) {
          token.role    = profile.role;
          token.name    = profile.name;
          token.email   = profile.email;
          token.picture = profile.avatar ?? token.picture;
        }
        token.lastSync = Math.floor(Date.now() / 1000);
      }

      return token;
    },

    // ── Expose JWT fields to the client session ────────────────────────────────
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        const u = session.user as Session["user"] & {
          id: string;
          role: UserRole;
          provider: "credentials" | "google";
        };
        u.id       = (token.id as string)       ?? "";
        u.role     = ((token.role as UserRole)   ?? "STUDENT");
        u.provider = ((token.provider as string) ?? "credentials") as "credentials" | "google";
      }
      return session;
    },
  },

  useSecureCookies: process.env.NODE_ENV === "production",
  debug:            process.env.NODE_ENV === "development",
};
