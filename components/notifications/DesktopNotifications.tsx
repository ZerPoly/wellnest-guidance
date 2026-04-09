'use client';

import React from 'react';
import { HiBell, HiCheck, HiTrash, HiArrowsExpand } from 'react-icons/hi'; // Added HiArrowsExpand
import { Notification } from '@/lib/api/types/notification.types';
import Link from 'next/link'; // Import Link for navigation

interface DesktopNotificationsProps {
  notifRef: React.RefObject<HTMLDivElement | null>;
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  notifications: Notification[];
  unreadCount: number;
  handleMarkAsRead: (id: string) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export default function DesktopNotifications({
  notifRef,
  notifOpen,
  setNotifOpen,
  notifications,
  unreadCount,
  handleMarkAsRead,
  handleMarkAllAsRead,
  handleDelete,
  loadMore,
  hasMore,
  loading,
}: DesktopNotificationsProps) {
  return (
    <div className="relative hidden md:block" ref={notifRef}>
      <button
        onClick={() => setNotifOpen(!notifOpen)}
        className="text-[var(--text)] relative p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <HiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Wrapper */}
      <div 
        className={`absolute right-0 mt-3 w-96 bg-[var(--bg-light)] shadow-xl rounded-2xl border border-[var(--outline)] overflow-hidden z-50 transition-all duration-200 ease-out origin-top-right ${
          notifOpen 
            ? 'opacity-100 scale-100 translate-y-0 visible' 
            : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--outline)] flex justify-between items-center bg-[var(--bg-light)]">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[var(--title)] text-lg">
              Notifications
            </span>
            {/* Maximize Button */}
            <Link 
              href="/notifications" 
              onClick={() => setNotifOpen(false)}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--cyan)] hover:bg-[var(--bg)] rounded-lg transition-all"
              title="See Full View"
            >
              <HiArrowsExpand size={18} />
            </Link>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-extrabold text-[var(--cyan)] hover:text-[var(--cyan-dark)] transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-[var(--text-muted)] font-bold text-sm">No Notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.notification_id}
                className={`p-4 border-b border-[var(--outline)] last:border-0 hover:bg-white/50 transition-colors relative group ${
                  !n.is_read ? 'bg-[var(--cyan)]/5' : ''
                }`}
              >
                {/* ... existing notification item code ... */}
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm pr-6 leading-snug ${!n.is_read ? 'font-extrabold text-[var(--title)]' : 'font-bold text-[var(--text-muted)]'}`}>
                    {n.title}
                  </h4>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.is_read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.notification_id); }}
                        className="text-[var(--cyan)] hover:text-[var(--cyan-dark)] p-1 bg-white rounded-md border border-[var(--outline)]"
                      >
                        <HiCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(n.notification_id); }}
                      className="text-red-500 hover:text-red-700 p-1 bg-white rounded-md border border-[var(--outline)]"
                    >
                      <HiTrash size={14} />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-[var(--text-muted)] leading-normal line-clamp-2">
                  {n.content}
                </p>
                
                <div className="flex items-center mt-2 justify-between">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                  {!n.is_read && (
                    <span className="w-2 h-2 bg-[var(--cyan)] rounded-full"></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--outline)] bg-[var(--bg-light)]">
            {hasMore ? (
            <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-4 text-xs font-extrabold text-[var(--text-muted)] hover:text-[var(--title)] hover:bg-[var(--card)] disabled:opacity-50 transition-colors uppercase"
            >
                {loading ? 'Loading...' : 'View More'}
            </button>
            ) : (
                <Link 
                    href="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block w-full py-4 text-center text-xs font-extrabold text-[var(--cyan)] hover:bg-[var(--card)] transition-colors uppercase"
                >
                    Open Notification Center
                </Link>
            )}
        </div>
      </div>
    </div>
  );
}