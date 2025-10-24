import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { unifiedLogin } from "@/lib/api/unifiedAuth";

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
          // Return detailed error messages
          switch (result.code) {
            case 'MISSING_Admin_CREDENTIALS':
              throw new Error("Missing credentials. Please check your input.");
            case 'AUTH_TOKEN_TIME_ERROR':
              throw new Error("Authentication time error. Please check your system clock.");
            case 'AUTH_UNAUTHORIZED_DOMAIN':
              throw new Error("Unauthorized email domain. Please use your institutional email.");
            case 'NETWORK_ERROR':
              throw new Error("Network error. Please check your connection and try again.");
            case 'INTERNAL_SERVER_ERROR':
              throw new Error("Server error. Please try again later.");
            default:
              throw new Error(result.message || "Invalid email or password");
          }
        }

        return {
          id: credentials.email,
          email: credentials.email,
          role: result.data.role,
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
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