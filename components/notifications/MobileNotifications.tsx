'use client';

import React from 'react';
import { HiX, HiCheck, HiTrash } from 'react-icons/hi';
import { Notification } from '@/lib/api/types/notification.types';

interface MobileNotificationsProps {
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  notifications: Notification[];
  handleMobileNotifClick: (href: string) => void;
  handleMarkAsRead: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  unreadCount: number;
}

export default function MobileNotifications({
  notifOpen,
  setNotifOpen,
  notifications,
  handleMobileNotifClick,
  handleMarkAsRead,
  handleDelete,
  unreadCount,
}: MobileNotificationsProps) {
  return (
    <div
      className={`fixed inset-0 z-[60] bg-[var(--bg-light)] transform transition-transform duration-300 ease-in-out md:hidden ${
        notifOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--outline)] bg-white">
        <div>
          <p className="font-extrabold text-[var(--text-muted)] text-sm uppercase">Notifications</p>
          <h2 className="font-extrabold text-2xl text-[var(--title)]">
            Your Updates {unreadCount > 0 && `(${unreadCount})`}
          </h2>
        </div>
        <button 
          onClick={() => setNotifOpen(false)} 
          className="p-2 bg-[var(--bg-light)] border border-[var(--outline)] rounded-xl text-[var(--title)]"
        >
          <HiX size={24} />
        </button>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto h-[calc(100vh-100px)] p-4 space-y-4 pb-24">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-extrabold text-[var(--text-muted)]">No notifications yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Check back later for updates</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notification_id}
              className={`p-5 rounded-2xl border border-[var(--outline)] transition-all ${
                !n.is_read ? 'bg-white shadow-md border-[var(--cyan)]' : 'bg-[var(--bg-light)]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1"
                  onClick={() => {
                    if (n.data?.href) handleMobileNotifClick(n.data.href);
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!n.is_read && <span className="w-2 h-2 bg-[var(--cyan)] rounded-full"></span>}
                    <h3 className={`text-lg leading-tight ${!n.is_read ? 'font-extrabold text-[var(--title)]' : 'font-bold text-[var(--text-muted)]'}`}>
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {n.content}
                  </p>
                  <span className="text-[10px] font-extrabold text-[var(--text-muted)] mt-3 block uppercase">
                    {new Date(n.created_at).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                {/* Mobile Action Buttons */}
                <div className="flex flex-col space-y-3 ml-4">
                  {!n.is_read && (
                    <button 
                      onClick={() => handleMarkAsRead(n.notification_id)}
                      className="p-3 bg-[var(--cyan)] text-[var(--text1)] rounded-xl shadow-sm"
                    >
                      <HiCheck size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(n.notification_id)}
                    className="p-3 bg-white border border-[var(--outline)] text-red-500 rounded-xl shadow-sm"
                  >
                    <HiTrash size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}