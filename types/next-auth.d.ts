import { DefaultSession, DefaultJWT } from "next-auth";

// --- Type Definitions for NextAuth ---
// This file extends the default NextAuth types to match the custom
// properties being added in the [...nextauth]/route.ts callbacks.

declare module "next-auth" {
  /**
   * The "User" object is returned by the `authorize` callback.
   * It is used to build the JWT on the initial sign-in.
   */
  interface User {
    id: string;
    email: string;
    role: "admin" | "counselor" | "super_admin";
    accessToken: string;
    refreshToken: string;
    // This custom property must be added
    accessTokenExpires: number; 
  }

  /**
   * The "Session" object is what is returned to the client
   * by `useSession()` or `getSession()`.
   */
  interface Session {
    user: {
      id: string;
      email: string;
      role: "admin" | "counselor" | "super_admin";
      accessToken: string;
      // Note: refreshToken is (and should be) omitted for security.
    } & DefaultSession["user"];

    // This custom property is added to the session
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  /**
   * The "JWT" (token) object is the server-side token.
   * It is what's passed between the `jwt` and `session` callbacks.
   */
  interface JWT {
    // --- FIX: Add 'sub' property ---
    // 'sub' (Subject) is the standard JWT claim for the user's ID.
    // NextAuth automatically maps the 'id' from the 'authorize' callback to 'sub'.
    // Adding it here makes token.sub available as a strict 'string'.
    sub: string;

    // These properties are added from the `authorize` callback
    // and are used by the `jwt` and `session` callbacks.
    // `sub` (subject) is automatically populated with the `user.id`
    email: string;
    role: "admin" | "counselor" | "super_admin";
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    
    // This custom property is added if a refresh fails
    error?: "RefreshAccessTokenError";
  }
}

