import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { unifiedLogin } from "@/lib/api/unifiedAuth";
import { refreshCounselorToken } from "@/lib/api/counselorRefresh";
import { jwtDecode } from "jwt-decode";
import { JWT } from "next-auth/jwt";

// Helper type for decoded token
interface DecodedToken {
  sub: string; // Standard JWT subject (this should be the user_id)
  user_id?: string; // Fallback
  role: "admin" | "counselor" | "super_admin";
  exp: number; // Expiration time in seconds
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

          // Get the user's ID (sub is standard)
          idFromToken = decoded.sub || decoded.user_id; 
          tokenExpires = decoded.exp * 1000; // Convert seconds to milliseconds

          if (!idFromToken) {
            throw new Error("Token missing 'sub' (user_id) claim.");
          }

        } catch (err) {
          console.error("Failed to decode access token:", err);
          throw new Error("Invalid access token received from server.");
        }

        // Return the full user object to be stored in the JWT
        return {
          // --- FIX 1: Pass the UUID as the 'id' ---
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
      // 1. Initial sign-in
      if (account && user) {
        // 'user' is the object returned from authorize()
        return {
          ...token,
          // 'user.id' (the UUID) is automatically stored in 'token.sub'
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          role: user.role,
        };
      }

      // 2. Token is still valid, return it
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // 3. Access token has expired, try to refresh it
      console.log("Access token expired. Refreshing...");
      try {
        // --- FIX 2: Use token.sub (which holds the UUID) ---
        if (!token.sub) {
          throw new Error("Token is missing 'sub' (user_id).");
        }
        
        const response = await refreshCounselorToken(
          token.sub, // 'token.sub' holds the 'id' from the authorize callback
          token.refreshToken as string
        );

        if (!response.success || !response.data) {
          console.error("Refresh API returned failure:", response.message);
          throw new Error("RefreshAccessTokenError");
        }

        const { access_token, refresh_token } = response.data;
        
        // Decode new token to get its expiration
        const decoded = jwtDecode<{ exp: number }>(access_token);

        return {
          ...token, // Keep old token info (email, role, sub)
          accessToken: access_token,
          refreshToken: refresh_token,
          accessTokenExpires: decoded.exp * 1000,
        };

      } catch (error) {
        console.error("Error refreshing access token", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },

    async session({ session, token }) {
      // Pass all the necessary data to the client-side session object
      session.user.id = token.sub; // 'sub' holds the UUID
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.accessToken = token.accessToken;
      
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

