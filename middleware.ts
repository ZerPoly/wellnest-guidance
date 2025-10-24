export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"],
};



// ## Project Structure

// your-project/
// ├── app/
// │   ├── api/
// │   │   └── auth/
// │   │       └── [...nextauth]/
// │   │           └── route.ts            # NextAuth config
// │   ├── dashboard/
// │   │   └── page.tsx                    # Protected dashboard
// │   ├── layout.tsx                      # Root layout with SessionProvider
// │   └── page.tsx                        # Login page (root)
// ├── components/
// │   └── LogoutButton.tsx                # Logout component
// ├── lib/
// │   ├── api/
// │   │   └── login/
// │   │       ├── adminAuth.ts            # Admin API calls
// │   │       ├── guidanceAuth.ts         # Guidance API calls
// │   │       └── unifiedAuth.ts          # Unified auth logic
// │   └── providers/
// │       └── SessionProvider.tsx         # Session provider
// ├── middleware.ts                        # Route protection
// ├── next-auth.d.ts                      # Type definitions
// └── .env.local                          # Environment variables