'use client';

import React, { useState, useCallback } from "react";
// Corrected import paths based on your confirmed structure
import Sidebar from "@/components/Sidebar"; 
import Header from "@/components/Header";   
import { AiOutlineClose } from 'react-icons/ai'; 
import StudentsContent from "@/components/students/StudentsContent";

// Placeholder component for the specific students content
const PlaceholderStudents = ({}: {}) => (
  <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[80vh]">
    <h1 className="text-3xl font-extrabold text-gray-800">Student Profiles & Data</h1>
    <p className="mt-2 text-gray-600">This section lists all students for search, filtering, and detailed profile views.</p>
  </div>
);

// --- Client Component (Holds the entire UI and State) ---
const StudentsClient = () => {
  
  // 1. State for sidebar highlighting: Set default to match this page's name
  const [activeTab, setActiveTab] = useState<string>("Students"); 
  // 2. State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);
  
  const handleTabChange = useCallback((tab: string) => {
    // 1. Update activeTab state for local visual feedback
    setActiveTab(tab); 
    // 2. Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    // NOTE: The actual navigation is handled by the <Link href={...}> inside the Sidebar.
  }, [isMobileMenuOpen]);


  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* 1. Sidebar Container (Fixed/Absolute for Mobile, Relative for Desktop) */}
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

      {/* 2. Main Content Container (Wraps Header and Students Content) */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header: Receives the toggle function */}
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        {/* Main Content Area: Renders the static page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <StudentsContent />
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

export default StudentsClient;
