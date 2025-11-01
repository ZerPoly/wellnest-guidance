'use client';

import React, { useState, useCallback } from "react";
import { AiOutlineClose } from 'react-icons/ai'; 
import { usePathname } from 'next/navigation';

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";


interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}


export default function AuthenticatedLayoutClient({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname(); // Used for highlighting the correct sidebar link
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);
  
  const handleLinkClick = useCallback(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);


  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* 1. Sidebar Container (Persistent) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onLinkClick={handleLinkClick}
        />
        
        {/* Mobile Close Button (Client component interaction) */}
        {isMobileMenuOpen && (
            <button
                onClick={toggleMobileMenu}
                className="absolute top-4 right-4 text-gray-200 p-2 rounded-full hover:bg-zinc-700 md:hidden z-50"
                aria-label="Close menu"
            >
                <AiOutlineClose size={24} />
            </button>
        )}
      </div>

      {/* 2. Main Content Container (Wraps Header and Page Content) */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header toggleMobileMenu={toggleMobileMenu} />
        {/* Main Content Area: Renders the child page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile Overlay Background */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </div>
  );
}
