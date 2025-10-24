import SessionProvider from "@/lib/providers/SessionProvider";
import "./globals.css";

export const metadata = {
  title: "Portal Login",
  description: "Admin and Guidance Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}