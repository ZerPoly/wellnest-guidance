'use client';

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import React, { useState, useCallback } from "react";
import { AiOutlineClose } from 'react-icons/ai'; 

// --- IMPORT THE DEDICATED CONTENT FILE ---
import Link from "next/link";
import { useSession } from "next-auth/react";
import CalendarView from "@/components/calendar/CalendarView";
import AgendaList from "@/components/calendar/AgendaList";
import ScheduleContent from "@/components/calendar/ScheduleContent";

interface DashboardClientProps {}

const DashboardClient = ({}: DashboardClientProps) => {
  const { data: session } = useSession();
    const userRole = session?.user?.role || 'Guest';
    const userEmail = session?.user?.email;
    // Use userNamePart for the alt text/title
    const userNamePart = userEmail ? userEmail.split('@')[0] : 'User';
  
  // 1. State for sidebar highlighting: Set default to match this specific page's name
  const [activeTab, setActiveTab] = useState<string>("Dashboard"); 
  // 2. State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    // Update activeTab state for local visual feedback
    setActiveTab(tab); 
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* 1. Sidebar (Fixed/Absolute for Mobile, Relative for Desktop) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange} 
          isMobileOpen={isMobileMenuOpen}
        />
        
        {/* Mobile Close Button (Inside Sidebar Overlay) */}
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

      {/* 2. Main Content Container */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Header: Receives the toggle function */}
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        {/* Main Content Area: Renders only the Dashboard content */}
        <main className="flex-1 overflow-y-auto px-6 pb-6 bg-gray-50">
          <div className="flex flex-col my-4">
            <div className="flex flex-row space-x-1">
              <Link href="/dashboard" className="font-extrabold text-[var(--text-muted)] hover:text-[var(--title)] transition-colors">
                Dashboard
              </Link>
              <a className="font-regular text-[var(--text-muted)] ">
                / Calendar
              </a>
            </div>
          </div>
          
          {/* Use the imported content component */}
          <div className="flex flex-col md:flex-row gap-6">
            <ScheduleContent />
          </div>
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
};

export default DashboardClient;
