'use client';

import React, { useState, useCallback } from "react";
// Corrected import paths based on your confirmed structure
import Sidebar from "@/components/Sidebar"; 
import Header from "@/components/Header";   
import { AiOutlineClose } from 'react-icons/ai'; 
import StudentsContent from "@/components/students/StudentsContent";
import Link from "next/link";

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
    <>
      <div className="mb-4">
        <div className="flex flex-row space-x-1">
          <Link href="/dashboard" className="font-extrabold text-[var(--text-muted)] hover:text-[var(--title)] transition-colors">
            Dashboard
          </Link>
          <a className="font-regular text-[var(--text-muted)] ">
            / Students
          </a>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--title)] hidden sm:block">
            Students
          </h1>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 min-w-0">
          <StudentsContent />
      </div>

      {/* Mobile Overlay Background */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </>
  );
};

export default StudentsClient;
