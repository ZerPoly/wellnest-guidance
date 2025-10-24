import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "admin" | "counselor" | "super_admin";
      accessToken: string;
      refreshToken: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: "admin" | "counselor" | "super_admin";
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: "admin" | "counselor" | "super_admin";
    accessToken: string;
    refreshToken: string;
  }
}