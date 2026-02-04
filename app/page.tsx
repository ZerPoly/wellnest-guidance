'use client';

import { useState, FormEvent, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; 

const PAGE_TITLE = "Portal Sign In";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // NEW STATE: To toggle password visibility
  const [showPassword, setShowPassword] = useState(false); 

  /*
  // Session Redirect Logic (Removed per your instruction)
  useEffect(() => { ... }, [status, router, searchParams]);
  */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result?.ok) {
        // SUCCESS: Redirect the user only AFTER successful sign in attempt
        const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Sign In error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // If already authenticated, show a message instead of the form
  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--primary)] p-4">
        <div className="w-full max-w-md bg-[var(--bg-light)] rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold text-[var(--cyan)]">Welcome Back!</h1>
          <p className="text-[var(--text-muted)]">You are already signed in as {session.user?.email}.</p>
          <a
            href="/dashboard"
            className="w-full inline-flex items-center justify-center px-4 py-3 text-lg font-bold rounded-full transition-colors bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-[var(--text1)]"
          >
            Go to Dashboard
          </a>
          <button 
            onClick={() => { router.push('/api/auth/signout'); }}
            className="w-full mt-4 px-4 py-2 text-sm text-red-500 hover:text-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show loading while checking session status before rendering form
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--primary)]">
        <div className="text-[var(--text1)] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--primary)] p-4">
      <div className="w-full max-w-md bg-[var(--bg-light)] rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--title)]">{PAGE_TITLE}</h1>
          <p className="text-[var(--text-muted)] mt-1">Sign in to your dedicated portal.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--title)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password Input (MODIFIED) */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Password
            </label>
            <input
              id="password"
              // DYNAMIC TYPE: switch between 'password' and 'text'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              // Added pr-10 for button spacing
              className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--title)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                // FIX: Disable the toggle button when submitting
                disabled={isSubmitting} 
                className="absolute inset-y-0 right-0 top-6 mr-3 flex items-center p-2 text-[var(--text-muted)] hover:text-[var(--title)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-4 py-3 text-lg font-bold rounded-full transition-colors bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-[var(--text1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--text1)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Info Text */}
        <p className="text-xs text-center text-[var(--text-muted)]">
          Your role will be automatically detected upon sign in.
        </p>
        
      </div>
    </div>
  );
}
