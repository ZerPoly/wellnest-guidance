import SessionProvider from "@/lib/providers/SessionProvider";
import ThemeProvider from '@/components/ThemeProvider';
import "./globals.css";
import { ToastProvider } from "@/lib/providers/ToastProvider";

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
          <ToastProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}