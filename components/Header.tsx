'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlineSearch, AiOutlineBell, AiOutlineMenu } from 'react-icons/ai'; 
import ThemeToggleButton from '@/components/ThemeToggleButton'; 

interface HeaderProps {
    toggleMobileMenu: () => void; 
}

// Define the static URL for your custom placeholder image
const PLACEHOLDER_AVATAR_URL = '/img/avatar-icon.png';

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu }) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'Guest';
  const userEmail = session?.user?.email;
  // Use userNamePart for the alt text/title
  const userNamePart = userEmail ? userEmail.split('@')[0] : 'User';

  return (
    <header className="h-18 bg-[var(--bg)] border-b border-zinc-800 p-4 flex items-center justify-between shadow-lg shrink-0">
      
      {/* Left Side: Mobile Menu Button & Greeting */}
      <div className="flex items-center space-x-4">
        
        {/* Mobile Menu Button (This is the button to OPEN the sidebar) */}
        <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-full hover:bg-zinc-700 text-gray-300 md:hidden"
            aria-label="Open menu"
        >
            <AiOutlineMenu size={22} />
        </button>

        <h1 className="text-2xl font-extrabold text-[var(--title)] hidden sm:block">
          {`Welcome back, ${userNamePart}!`}
        </h1>
      </div>

      {/* Center: Search Bar (Hides on extra small mobile screens) */}
      {/* <div className="flex-1 max-w-xl mx-4 hidden sm:block">
          <div className="relative">
            <AiOutlineSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, reports, or trends..."
              className="w-full py-2 pl-10 pr-4 bg-zinc-800 text-gray-100 text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500"
            />
          </div>
      </div> */}

      {/* Right Side: Icons and User Avatar */}
      <div className="flex items-center space-x-4">
        
        {/* Notification Bell */}
        <button className="p-2 rounded-full hover:bg-zinc-700 transition-colors text-gray-300 relative">
          <AiOutlineBell size={22} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-zinc-900"></span>
        </button>

        {/* Theme Toggle Button */}
        <ThemeToggleButton />

        {/* User Avatar & Role */}
        <div className="flex items-center space-x-2 cursor-pointer group">
          <div 
            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-blue-400 shadow-md"
            title={`Role: ${userRole}`}
          >
            {/* Conditional rendering: use image if user.image is available, else use your custom placeholder */}
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={userNamePart}
                className="w-full h-full object-cover"
              />
            ) : (
              // --- YOUR CUSTOM PLACEHOLDER ---
              <img
                src={PLACEHOLDER_AVATAR_URL}
                alt={`${userNamePart}'s Avatar`}
                // Ensure the placeholder image scales to cover the 100% of the div
                className="w-full h-full object-cover" 
                // Add a fallback if the image fails to load
                onError={(e) => {
                  // Fallback to a solid color/initials logic if the placeholder image is missing
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
