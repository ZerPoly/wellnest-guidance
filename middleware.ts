import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define the roles allowed to access the /dashboard routes
const ALLOWED_ROLES = ["admin", "counselor", "super_admin"];

// 1. Wrap the default export with withAuth to automatically handle token decryption
export default withAuth(
  // 2. Middleware function runs after successful token validation
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    // Check if the user is trying to access a protected dashboard route
    if (pathname.startsWith("/dashboard")) {
      const userRole = token?.role;

      // 3. Check if the user's role is NOT included in the allowed list
      if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
        console.log(`ACCESS DENIED: Role ${userRole} attempted to access ${pathname}`);
        
        // Redirect unauthorized roles (like 'student') back to the sign-in page
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    
    // Allow access for authenticated, authorized users
    return NextResponse.next();
  },
  {
    // Configuration to ensure the token is read correctly
    callbacks: {
      // Only require authentication if accessing a matched path in config.matcher
      authorized: ({ token }) => !!token,
    },
  }
);

// Configuration defines which routes the middleware should run on
export const config = {
  matcher: ["/dashboard/:path*"],
};
