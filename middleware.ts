import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = ["admin", "counselor", "super_admin"];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const userRole = token?.role;

    // 1. Kick out anyone without a valid role
    if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const isAdmin = userRole === "admin" || userRole === "super_admin";
    const isCounselor = userRole === "counselor";

    // 2. Define the exact restricted zones based on your sidebarData
    const counselorZones = ["/dashboard", "/calendar", "/students"];
    const adminZones = ["/adminDashboard", "/users", "/promotional"];

    // 3. Block Admins from Counselor routes
    if (isAdmin && counselorZones.some(zone => pathname.startsWith(zone))) {
      console.log(`Rerouting Admin away from ${pathname} to /adminDashboard`);
      return NextResponse.redirect(new URL("/adminDashboard", req.url));
    }

    // 4. Block Counselors from Admin routes
    if (isCounselor && adminZones.some(zone => pathname.startsWith(zone))) {
      console.log(`ACCESS DENIED: Rerouting Counselor away from ${pathname} to /dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // If they pass the checks, let them through
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// 5. Tell the middleware to watch ALL of these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/students/:path*",
    "/adminDashboard/:path*", 
    "/users/:path*",
    "/promotional/:path*",
    "/account/:path*" // assuming everyone can access their own account page
  ],
};