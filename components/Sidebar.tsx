'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

import { NAV_ITEMS, NavItem } from '@/data/sidebarData';

import { 
  AiOutlineMenuFold, 
  AiOutlineMenuUnfold, 
  AiOutlineLogout 
} from 'react-icons/ai';

import { 
  TbLayoutSidebarRightCollapseFilled,
  TbLayoutSidebarLeftCollapseFilled  
} from "react-icons/tb";

// Constant for localStorage key
const COLLAPSE_STATE_KEY = 'sidebarCollapsed';

// --- Component Props ---

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean; // <--- NEW PROP ADDED
}

// Helper component for minimalist elegant tooltip
const TooltipWrapper: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => (
    <div className="relative group">
        {children}
        <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-zinc-700 text-white text-xs rounded-md 
                     border border-zinc-600 shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200 pointer-events-none z-50">
            {content}
        </div>
    </div>
);

// --- Component ---

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen }) => { // <--- RECEIVING NEW PROP
  
  // 1. Initialize state (unchanged - relies on SSR default)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); 

  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userEmail = session?.user?.email;

  // 2. Local Storage Logic (unchanged)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem(COLLAPSE_STATE_KEY);
      if (storedState !== null) {
        setIsCollapsed(JSON.parse(storedState));
      }
      setIsLoaded(true);
    }
  }, []); 

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(COLLAPSE_STATE_KEY, JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isLoaded]);


  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const getFilteredNavItems = (role: string | undefined): NavItem[] => {
    if (!role) return [];
    return NAV_ITEMS.filter(item => item.roles.includes(role as 'admin' | 'counselor' | 'super_admin'));
  };

  const filteredItems = getFilteredNavItems(userRole);

  // LOGIC FIX: Determine the visual collapsed state
  // It is only truly collapsed if the persisted state says so AND we are NOT in the mobile overlay view.
  const isVisuallyCollapsed = isCollapsed && !isMobileOpen;

  // The sidebar size now depends on the visual state
  const sidebarWidth = isVisuallyCollapsed ? 'w-20' : 'w-64';

  return (
    <aside
      className={`h-screen bg-[var(--primary)] text-gray-200 flex flex-col transition-all duration-300 ${sidebarWidth} shadow-2xl shrink-0 p-4`}
    >
      
      <div className="flex flex-col flex-1 gap-4">
        
        {/* Logo and Toggle Button */}
        <div className="h-10 flex items-center justify-between">
            {/* Show logo if NOT visually collapsed */}
            {!isVisuallyCollapsed && (
                <img 
                    src="/img/title.png" 
                    alt="Wellnest Logo" 
                    className="h-4 object-contain" 
                />
            )}
            <button
                onClick={toggleSidebar}
                title={isCollapsed ? "Expand" : "Collapse"}
                // Only show this button on desktop (md:block)
                className={`${isVisuallyCollapsed ? 'mx-auto' : ''} text-2xl p-2 rounded-full hover:bg-zinc-700 transition-colors text-gray-300 hidden md:block`}
            >
                {/* {isCollapsed ? <AiOutlineMenuUnfold size={24} /> : <AiOutlineMenuFold size={24} />} */}
                {isCollapsed ? <TbLayoutSidebarRightCollapseFilled size={24} /> : <TbLayoutSidebarLeftCollapseFilled size={24} />}
            </button>
        </div>

        {/* New Report Button */}
        {!isVisuallyCollapsed && ( // Use isVisuallyCollapsed
          <button 
            className="w-full bg-blue-700 text-white font-medium py-2.5 px-4 text-sm rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
          >
            + New Report
          </button>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 pt-4 border-t border-zinc-800">
          {filteredItems.map((item) => {
            const isActive = activeTab === item.name;
            const linkClasses = `p-2.5 flex items-center cursor-pointer transition-colors text-sm rounded-xl ${
              isActive 
                ? 'bg-zinc-700 font-medium text-white' 
                : 'hover:bg-zinc-800 text-gray-300'
            }`;

            const linkContent = (
              <div className="flex items-center space-x-4 w-full">
                {/* Center icon only if visually collapsed */}
                <div className={`${isVisuallyCollapsed ? 'w-full flex justify-center' : 'w-6'}`}>
                    <item.icon size={18} />
                </div>
                
                {/* Show text if NOT visually collapsed */}
                {!isVisuallyCollapsed && <span className="truncate">{item.name}</span>}
              </div>
            );

            return (
              <Link key={item.name} href={item.href} onClick={() => setActiveTab(item.name)}>
                {isVisuallyCollapsed ? (
                  <TooltipWrapper content={item.name}>
                    <div className={linkClasses}>{linkContent}</div>
                  </TooltipWrapper>
                ) : (
                  <div className={linkClasses}>{linkContent}</div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section: Version, User, Logout */}
      <div className="flex flex-col gap-2 pt-4 border-t border-zinc-700">
        
        {/* Version Indicator */}
        {!isVisuallyCollapsed && (
            <div className="text-xs text-center text-gray-500 pb-2">
                v1.0.0
            </div>
        )}

        {/* User Info / Role */}
        <div className={`p-2 rounded-xl text-gray-400 text-sm ${isVisuallyCollapsed ? 'text-center' : 'text-left'}`}>
            {isVisuallyCollapsed ? userRole?.charAt(0).toUpperCase() : (
                <div className="flex flex-col">
                    <span className="font-semibold text-white text-sm">{userRole}</span>
                    <span className="text-xs text-gray-400 truncate">{userEmail}</span>
                </div>
            )}
        </div>

        {/* Logout Button */}
        <button 
          className={`p-3 rounded-xl flex items-center transition-colors text-red-400 hover:bg-zinc-800 text-sm ${isVisuallyCollapsed ? 'justify-center' : ''}`}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          {isVisuallyCollapsed ? (
            <TooltipWrapper content="Logout">
              <div className="flex items-center"> 
                <AiOutlineLogout size={20} />
              </div>
            </TooltipWrapper>
          ) : (
            <div className="flex items-center space-x-4">
              <AiOutlineLogout size={20} />
              <span className="font-medium">Logout</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
