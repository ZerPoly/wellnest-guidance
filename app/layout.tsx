import SessionProvider from "@/lib/providers/SessionProvider";
import ThemeProvider from '@/components/ThemeProvider';
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
        <SessionProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}