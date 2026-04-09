'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// ✅ FIX: Swapped Ai outline icons for the exact Hi solid icons used in the Student module
import { HiBell, HiMenu } from 'react-icons/hi'; 
import ThemeToggleButton from '@/components/ThemeToggleButton'; 

import { useNotifications } from '@/hooks/useNotifications';
import DesktopNotifications from '@/components/notifications/DesktopNotifications'; 
import MobileNotifications from '@/components/notifications/MobileNotifications'; 

interface HeaderProps {
  toggleMobileMenu: () => void; 
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu }) => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const userRole = session?.user?.role || 'Guest';
  const userEmail = session?.user?.email;
  const userNamePart = userEmail ? userEmail.split('@')[0] : 'User';

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    loadMore,
    hasMore,
    loading
  } = useNotifications();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleMobileNotifClick = (href: string) => {
    setNotifOpen(false);
    router.push(href);
  };

  return (
    <>
      <header className="h-18 bg-[var(--bg-light)] border-b border-[var(--outline)] p-4 flex items-center justify-between shadow-lg shrink-0 relative z-50">
        
        {/* Left side: mobile menu button */}
        <div className="flex items-center space-x-4">
          <button 
              onClick={toggleMobileMenu}
              // ✅ FIX: Exactly matches the student module's menu button classes
              className="text-[var(--text)] focus:outline-none p-1 md:hidden"
              aria-label="Open menu"
          >
              <HiMenu size={24} />
          </button>
        </div>

        {/* Right side: icons and user avatar */}
        <div className="flex items-center space-x-4">
          
          <DesktopNotifications 
            notifRef={notifRef}
            notifOpen={notifOpen}
            setNotifOpen={setNotifOpen}
            notifications={notifications}
            unreadCount={unreadCount}
            handleMarkAsRead={handleMarkAsRead}
            handleMarkAllAsRead={handleMarkAllAsRead}
            handleDelete={handleDelete}
            loadMore={loadMore}
            hasMore={hasMore}
            loading={loading}
          />

          {/* --- MOBILE NOTIFICATION BELL TRIGGER --- */}
          <button 
            onClick={() => setNotifOpen(true)}
            // ✅ FIX: Exactly matches the student module's bell button classes and badge alignment
            className="md:hidden text-[var(--text)] relative p-1 focus:outline-none"
          >
            <HiBell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-extrabold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <ThemeToggleButton />

          <Link href="/account" className="flex items-center space-x-2 cursor-pointer group">
            <div 
              className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-400 shadow-md hover:ring-2 hover:ring-blue-400/50 transition-all"
              title={`Role: ${userRole}`}
            >
              <img
                src="/img/avatar-icon.png"
                alt={`${userNamePart}'s avatar`}
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </Link>
        </div>
      </header>

      <MobileNotifications 
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        notifications={notifications}
        handleMobileNotifClick={handleMobileNotifClick}
        handleMarkAsRead={handleMarkAsRead}
        handleDelete={handleDelete}
        unreadCount={unreadCount}
      />
    </>
  );
};

export default Header;