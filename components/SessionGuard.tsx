'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * SessionGuard
 *
 * Handles two scenarios that NextAuth's server-side JWT callback misses:
 *
 * 1. WAKE FROM SLEEP / LAPTOP OPEN — The browser's visibilitychange event fires
 *    when you return. We check if the token is expired and force update() which
 *    triggers the JWT callback on the server to refresh it.
 *
 * 2. LONG IDLE — A periodic check every 2 minutes catches tokens that expired
 *    while the tab was open but unused.
 *
 * If refresh fails (RefreshAccessTokenError), the user is signed out and
 * redirected to the sign-in page.
 */
export default function SessionGuard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const isRefreshing = useRef(false);

  const checkAndRefresh = async () => {
    // Don't run if already refreshing, unauthenticated, or no session yet
    if (isRefreshing.current || status !== "authenticated" || !session) return;

    // If there's already a refresh error, sign out immediately
    if (session.error === "RefreshAccessTokenError") {
      console.warn("🔴 Session has a refresh error — signing out.");
      await signOut({ callbackUrl: "/" });
      return;
    }

    // Check if the active token is expired or about to expire (within 60s)
    const activeToken = session.adminToken || session.counselorToken;
    if (!activeToken) return;

    try {
      const payload = JSON.parse(atob(activeToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const secondsUntilExpiry = payload.exp - now;

      if (secondsUntilExpiry < 60) {
        console.log(`⏰ SessionGuard: Token expires in ${secondsUntilExpiry}s — forcing refresh...`);
        isRefreshing.current = true;

        await update(); // triggers JWT callback on server → calls refresh API

        console.log("✅ SessionGuard: Session updated.");
      }
    } catch (e) {
      console.error("SessionGuard: Failed to decode token", e);
    } finally {
      isRefreshing.current = false;
    }
  };

  // 1. Trigger on tab becoming visible (covers laptop wake + tab switch back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ SessionGuard: Tab visible — checking token...");
        checkAndRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [session, status]);

  // 2. Periodic check every 2 minutes for long idle sessions
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndRefresh();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session, status]);

  // 3. On mount — check immediately in case we loaded with an expired token
  useEffect(() => {
    if (status === "authenticated") {
      checkAndRefresh();
    }
  }, [status]);

  // Sign out if error propagates to session
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      console.warn("🔴 SessionGuard: RefreshAccessTokenError detected — signing out.");
      signOut({ callbackUrl: "/" });
    }
  }, [session?.error]);

  return null; // purely behavioral, no UI
}