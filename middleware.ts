import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = ["admin", "counselor", "super_admin"];

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const userRole = token?.role;

    // kick out anyone without a valid role
    if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const isAdmin = userRole === "admin" || userRole === "super_admin";
    const isCounselor = userRole === "counselor";

    // restricted zones
    const counselorZones = ["/dashboard", "/calendar", "/students"];
    const adminZones = ["/adminDashboard", "/users", "/promotional"];

    // block admin from counselors
    if (isAdmin && counselorZones.some(zone => pathname.startsWith(zone))) {
      console.log(`Rerouting Admin away from ${pathname} to /adminDashboard`);
      return NextResponse.redirect(new URL("/adminDashboard", req.url));
    }

    // block counselors from admin
    if (isCounselor && adminZones.some(zone => pathname.startsWith(zone))) {
      console.log(`ACCESS DENIED: Rerouting Counselor away from ${pathname} to /dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/students/:path*",
    "/adminDashboard/:path*", 
    "/users/:path*",
    "/promotional/:path*",
    "/account/:path*"
  ],
};