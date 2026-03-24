'use client';

import { useState, FormEvent, Suspense, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; 

const PAGE_TITLE = "Portal Sign In";

function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); 

  // ✅ Role-based destination logic
  const getDestination = (role?: string) => {
    if (role === "admin" || role === "super_admin") {
      return "/adminDashboard";
    }
    return "/dashboard"; // Default for guidance/counselor
  };

  // ✅ Watch for authentication status and redirect based on role
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const destination = getDestination(session.user.role);
      router.replace(destination);
    }
  }, [status, session, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false, // We handle redirection manually via useEffect
      });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result?.ok) {
        // Refresh the page data to ensure NextAuth session is populated
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Prevent flicker: show loading/redirecting state if already authed or loading
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--dark-blue)]">
        <div className="text-[var(--button-text)] text-lg animate-pulse">
          {status === "authenticated" ? "Redirecting to Dashboard..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--dark-blue)] p-4">
      <div className="w-full max-w-md bg-[var(--card)] rounded-2xl p-8 shadow-2xl space-y-6">
        
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--title)]">{PAGE_TITLE}</h1>
          <p className="text-[var(--foreground-muted)] mt-1">Sign in to your dedicated portal.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-bold">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-[var(--foreground-muted)] mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-placeholder)] focus:ring-2 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition disabled:opacity-50"
              placeholder="name@example.com"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-bold text-[var(--foreground-muted)] mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-placeholder)] focus:ring-2 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition disabled:opacity-50 pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              disabled={isSubmitting} 
              className="absolute right-0 top-[2.1rem] mr-2 flex items-center p-2 text-[var(--foreground-muted)] hover:text-[var(--title)] transition-colors"
            >
              {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </button>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-4 text-lg font-extrabold rounded-full transition-all bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-[var(--button-text)] shadow-lg shadow-[var(--cyan)]/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="text-xs text-center text-[var(--foreground-muted)] font-medium">
          Your role will be automatically detected upon sign in.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInFormContent />
    </Suspense>
  );
}