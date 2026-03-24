import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { unifiedLogin } from "@/lib/api/unifiedAuth";
import { refreshCounselorToken } from "@/lib/api/counselorRefresh";
import { refreshAdminToken } from "@/lib/api/adminRefresh";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  user_id?: string;
  role: "admin" | "counselor" | "super_admin";
  exp: number;
  iat: number;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
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
          if (claim === "admin") roleFromToken = "admin";
          else if (claim === "counselor") roleFromToken = "counselor";
          else if (claim === "super_admin") roleFromToken = "super_admin";

          idFromToken = decoded.sub || decoded.user_id;
          tokenExpires = decoded.exp * 1000;

          if (!idFromToken) {
            throw new Error("Token missing 'sub' (user_id) claim.");
          }
        } catch (err) {
          console.error("Failed to decode access token:", err);
          throw new Error("Invalid access token received from server.");
        }

        return {
          id: idFromToken,
          email: credentials.email,
          role: roleFromToken,
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token,
          accessTokenExpires: tokenExpires,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // 1. Initial sign-in — persist everything from authorize()
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          role: user.role,
        };
      }

      // 2. Token still valid — return as-is
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // 3. Token expired — refresh using the correct endpoint based on role
      console.log(`Access token expired for role: ${token.role}. Refreshing...`);

      try {
        if (!token.sub) {
          throw new Error("Token is missing 'sub' (user_id).");
        }

        const isAdmin =
          token.role === "admin" || token.role === "super_admin";

        // ✅ Call the correct refresh endpoint based on role
        const response = isAdmin
          ? await refreshAdminToken(token.sub, token.refreshToken as string)
          : await refreshCounselorToken(token.sub, token.refreshToken as string);

        if (!response.success || !response.data) {
          console.error("Refresh API returned failure:", response.message);
          throw new Error("RefreshAccessTokenError");
        }

        const { access_token, refresh_token } = response.data;
        const decoded = jwtDecode<{ exp: number }>(access_token);

        console.log(`✅ Token refreshed successfully for role: ${token.role}`);

        return {
          ...token,
          accessToken: access_token,
          refreshToken: refresh_token,
          accessTokenExpires: decoded.exp * 1000,
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
      session.user.id = token.sub;
      session.user.email = token.email;
      session.user.role = token.role;
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
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};