'use client';

import React, { useState } from 'react';
import { HiBell, HiCheck, HiTrash, HiOutlineInbox, HiChevronLeft, HiRefresh } from 'react-icons/hi';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToastContext } from '@/lib/providers/ToastProvider';

// ✅ Import the universal hook we just fixed!
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPage() {
  const { data: session } = useSession();
  const { success: showSuccess } = useToastContext();

  // Local state just to track if the current loading is specifically from the "Load More" button
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ✅ Pull everything from the hook
  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    loadMore,
  } = useNotifications();

  // --- Dynamic Dashboard Link based on Role ---
  const role = session?.user?.role;
  const dashboardLink = 
    role === 'admin' || role === 'super_admin' ? '/admin' : // Change to your actual admin dashboard path
    role === 'counselor' ? '/guidance' :                    // Change to your actual guidance dashboard path
    '/home';                                                // Student default

  // Wrappers to add toast notifications to the hook's actions
  const onMarkAllRead = async () => {
    await handleMarkAllAsRead();
    showSuccess("All notifications marked as read");
  };

  const onDelete = async (id: string) => {
    await handleDelete(id);
    showSuccess("Notification deleted");
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  };

  const handleRefresh = async () => {
    await fetchNotifications(true);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 lg:px-8 text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <Link 
              href={dashboardLink} 
              className="inline-flex items-center text-sm font-extrabold text-[var(--foreground-muted)] hover:text-[var(--cyan)] transition-colors mb-2"
            >
              <HiChevronLeft className="mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-[var(--title)] flex items-center gap-3">
              Notification Center
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2.5 bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl text-[var(--foreground-muted)] hover:text-[var(--cyan)] transition-all"
              title="Refresh"
            >
              <HiRefresh size={20} className={loading && !isLoadingMore ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="px-5 py-2.5 bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl font-bold text-sm text-[var(--foreground-muted)] hover:bg-[var(--card-dark)] transition-all disabled:opacity-50"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notifications Container */}
        <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
          {loading && !isLoadingMore && notifications.length === 0 ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cyan)] mx-auto mb-4"></div>
              <p className="text-[var(--foreground-muted)] font-bold">Loading your updates...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-20 text-center">
              <HiOutlineInbox className="text-6xl text-[var(--border)] mx-auto mb-4" />
              <h2 className="text-xl font-extrabold text-[var(--title)]">All caught up!</h2>
              <p className="text-[var(--foreground-muted)]">No notifications to show right now.</p>
            </div>
          ) : (
            <>
              <div className="divide-y-2 divide-[var(--line)]">
                {notifications.map((n) => (
                  <div 
                    key={n.notification_id}
                    className={`p-6 transition-all hover:bg-[var(--card-dark)] flex items-start gap-4 group ${
                      !n.is_read ? 'bg-[var(--cyan)]/5 border-l-4 border-l-[var(--cyan)]' : 'bg-transparent'
                    }`}
                  >
                    {/* Icon Column */}
                    <div className={`p-3 rounded-2xl shrink-0 ${!n.is_read ? 'bg-[var(--cyan)] text-white' : 'bg-[var(--background)] text-[var(--foreground-muted)]'}`}>
                      <HiBell size={24} />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-lg mb-1 truncate pr-4 ${!n.is_read ? 'font-black text-[var(--title)]' : 'font-bold text-[var(--foreground-muted)]'}`}>
                          {n.title}
                        </h3>
                        <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider whitespace-nowrap">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[var(--foreground)] leading-relaxed mb-4">
                        {n.content}
                      </p>

                      {/* Action Row */}
                      <div className="flex items-center gap-3">
                        {!n.is_read && (
                          <button 
                            onClick={() => handleMarkAsRead(n.notification_id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--cyan)] text-white text-xs font-black rounded-full hover:bg-[var(--cyan-dark)] transition-all shadow-sm"
                          >
                            <HiCheck /> Mark Read
                          </button>
                        )}
                        <button 
                          onClick={() => onDelete(n.notification_id)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--card)] border border-[var(--border)] text-red-500 text-xs font-black rounded-full hover:bg-[var(--card-dark)] transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <HiTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginated Footer */}
              {hasMore && (
                <div className="p-6 bg-[var(--card)] border-t-2 border-[var(--border)] text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-8 py-3 bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl font-black text-[var(--title)] hover:bg-[var(--card-dark)] transition-all disabled:opacity-50"
                  >
                    {isLoadingMore ? 'Loading older notifications...' : 'Load Older Notifications'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}