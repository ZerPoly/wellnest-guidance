'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function TokenDebugger() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [tokenMaxAge, setTokenMaxAge] = useState<number>(15 * 60); // fallback: 15 mins

  // Determine which token to use based on role
  const role = session?.user?.role;
  const activeToken =
    role === "admin" || role === "super_admin"
      ? session?.adminToken
      : session?.counselorToken;

  const roleLabel =
    role === "admin"
      ? "Admin"
      : role === "super_admin"
      ? "Super Admin"
      : role === "counselor"
      ? "Counselor"
      : "Unknown";

  const roleBadgeColor =
    role === "admin" || role === "super_admin"
      ? "bg-purple-100 text-purple-700"
      : "bg-cyan-100 text-cyan-700";

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeToken) {
        try {
          const payload = JSON.parse(atob(activeToken.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          const remaining = payload.exp - now;
          setTimeLeft(remaining > 0 ? remaining : 0);

          // Compute max age from iat → exp on first decode
          if (payload.iat && payload.exp) {
            setTokenMaxAge(payload.exp - payload.iat);
          }
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeToken]);

  const handleManualRefresh = async () => {
    setLoading(true);
    await update();
    setLoading(false);
  };

  if (!session) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, ((timeLeft || 0) / tokenMaxAge) * 100);
  const isExpiringSoon = timeLeft !== null && timeLeft < 60;
  const isExpired = timeLeft === 0;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-72">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Token Debugger</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeColor}`}>
          {roleLabel}
        </span>
      </div>

      {/* Timer */}
      <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-100">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Access Expiry:</span>
          <span
            className={`text-sm font-mono font-bold ${
              isExpired
                ? 'text-red-700'
                : isExpiringSoon
                ? 'text-red-500 animate-pulse'
                : 'text-blue-600'
            }`}
          >
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-1.5 mt-1 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              isExpired
                ? 'bg-red-700'
                : isExpiringSoon
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isExpired && (
          <p className="text-[10px] text-red-600 font-semibold mt-1 text-center">
            ⚠️ Token expired — refresh now
          </p>
        )}
      </div>

      {/* Token preview */}
      <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-100">
        <p className="text-[10px] text-gray-400 mb-1 uppercase font-semibold">
          {roleLabel} Token (preview)
        </p>
        <p className="text-[10px] font-mono text-gray-500 break-all leading-relaxed line-clamp-2">
          {activeToken
            ? `${activeToken.substring(0, 40)}...`
            : "No token found"}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm py-2 px-4 rounded transition"
        >
          {loading ? "Syncing..." : "🔄 Force Token Sync"}
        </button>

        <p className="text-[10px] text-gray-400 text-center italic">
          Auto-refresh triggers on expiry · Role: {roleLabel}
        </p>
      </div>
    </div>
  );
}