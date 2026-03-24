'use client';

import { useState, FormEvent, Suspense } from "react";
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
        const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--dark-blue)] p-4">
        <div className="w-full max-w-md bg-[var(--card)] rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold text-[var(--title)]">Welcome Back!</h1>
          <p className="text-[var(--foreground-muted)]">You are already signed in as {session.user?.email}.</p>
          <a
            href="/dashboard"
            className="w-full inline-flex items-center justify-center px-4 py-3 text-lg font-bold rounded-full transition-colors bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-[var(--button-text)]"
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

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--dark-blue)]">
        <div className="text-[var(--button-text)] text-lg">Loading...</div>
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
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-placeholder)] focus:ring-2 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition disabled:opacity-50"
              placeholder="name@example.com"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-placeholder)] focus:ring-2 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition disabled:opacity-50 pr-10"
              placeholder="••••••••"
            />
            <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                disabled={isSubmitting} 
                className="absolute right-0 top-[2.1rem] mr-3 flex items-center p-2 text-[var(--foreground-muted)] hover:text-[var(--title)] transition-colors"
            >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-4 py-3 text-lg font-bold rounded-full transition-colors bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-[var(--button-text)] disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-[var(--foreground-muted)]">
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