import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { unifiedLogin } from "@/lib/api/unifiedAuth";
import { refreshCounselorToken } from "@/lib/api/counselorRefresh";
import { refreshAdminToken } from "@/lib/api/adminRefresh";
import { jwtDecode } from "jwt-decode";

// ── Type augmentation ──────────────────────────────────────────────────────────

declare module "next-auth" {
  interface User {
    role: "admin" | "counselor" | "super_admin";
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    userId: string; // ✅ explicitly typed
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: "admin" | "counselor" | "super_admin";
      accessToken: string;
    };
    adminToken?: string;
    counselorToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "counselor" | "super_admin";
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    userId: string; // ✅ explicitly stored — never rely on token.sub alone
    error?: string;
  }
}

// ── Decoded token shape ────────────────────────────────────────────────────────

interface DecodedToken {
  sub: string;
  user_id?: string;
  role: "admin" | "counselor" | "super_admin";
  exp: number;
  iat: number;
}

// ── Auth options ───────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        const result = await unifiedLogin(credentials.email, credentials.password);

        if (!result.success || !result.data) {
          throw new Error(result.message || "Invalid email or password");
        }

        let roleFromToken: "admin" | "counselor" | "super_admin" = "counselor";
        let idFromToken: string | undefined;
        let tokenExpires: number;

        try {
          const decoded = jwtDecode<DecodedToken>(result.data.access_token);

          const claim = decoded.role;
          if (claim === "admin")       roleFromToken = "admin";
          else if (claim === "counselor")   roleFromToken = "counselor";
          else if (claim === "super_admin") roleFromToken = "super_admin";

          // ✅ Prefer sub, fall back to user_id claim
          idFromToken = decoded.sub || decoded.user_id;
          tokenExpires = decoded.exp * 1000;

          if (!idFromToken) {
            throw new Error("Token missing 'sub' / 'user_id' claim.");
          }

          // Quick UUID sanity check at login time so we catch bad tokens early
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(idFromToken)) {
            throw new Error(`Token 'sub' is not a valid UUID: ${idFromToken}`);
          }

        } catch (err) {
          console.error("Failed to decode access token:", err);
          throw new Error("Invalid access token received from server.");
        }

        return {
          id:                 idFromToken, // NextAuth puts this in token.sub
          userId:             idFromToken, // ✅ also store explicitly
          email:              credentials.email,
          role:               roleFromToken,
          accessToken:        result.data.access_token,
          refreshToken:       result.data.refresh_token,
          accessTokenExpires: tokenExpires,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // 1. Initial sign-in — store everything explicitly
      if (account && user) {
        return {
          ...token,
          userId:             user.userId,   // ✅ stored explicitly
          accessToken:        user.accessToken,
          refreshToken:       user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          role:               user.role,
        };
      }

      // 2. Token still valid — return as-is
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // 3. Token expired — refresh using correct endpoint per role
      console.log(`Access token expired for role: ${token.role}. Refreshing...`);

      try {
        // ✅ Use token.userId (explicit) — NOT token.sub (can be undefined)
        const userId = token.userId;

        if (!userId) {
          throw new Error("token.userId is missing — cannot refresh.");
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          throw new Error(`token.userId is not a valid UUID: ${userId}`);
        }

        const isAdmin = token.role === "admin" || token.role === "super_admin";

        const response = isAdmin
          ? await refreshAdminToken(userId, token.refreshToken as string)
          : await refreshCounselorToken(userId, token.refreshToken as string);

        if (!response.success || !response.data) {
          console.error("Refresh API returned failure:", response.message);
          throw new Error("RefreshAccessTokenError");
        }

        const { access_token, refresh_token } = response.data;
        const decoded = jwtDecode<{ exp: number }>(access_token);

        console.log(`✅ Token refreshed successfully for role: ${token.role}`);

        return {
          ...token,
          accessToken:        access_token,
          refreshToken:       refresh_token,
          accessTokenExpires: decoded.exp * 1000,
          error:              undefined,
        };

      } catch (error) {
        console.error("Error refreshing access token:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },

    async session({ session, token }) {
      session.user.id          = token.userId; // ✅ use explicit userId
      session.user.email       = token.email as string;
      session.user.role        = token.role;
      session.user.accessToken = token.accessToken;

      if (token.role === "counselor") {
        session.counselorToken = token.accessToken as string;
      } else if (token.role === "admin" || token.role === "super_admin") {
        session.adminToken = token.accessToken as string;
      }

      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },

  pages: {
    signIn: "/",
    error:  "/",
  },
  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};