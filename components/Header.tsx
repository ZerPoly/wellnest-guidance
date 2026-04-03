'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AiOutlineSearch, AiOutlineBell, AiOutlineMenu } from 'react-icons/ai'; 
import ThemeToggleButton from '@/components/ThemeToggleButton'; 

interface HeaderProps {
  toggleMobileMenu: () => void; 
}

const Header: React.FC<HeaderProps> = ({ toggleMobileMenu }) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'Guest';
  const userEmail = session?.user?.email;
  const userNamePart = userEmail ? userEmail.split('@')[0] : 'User';

  return (
    <header className="h-18 bg-(--bg-light) border-b border-(--outline) p-4 flex items-center justify-between shadow-lg shrink-0">
      
      {/* left side: mobile menu button */}
      <div className="flex items-center space-x-4">
        <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-full hover:bg-zinc-700 text-gray-300 md:hidden"
            aria-label="Open menu"
        >
            <AiOutlineMenu size={22} />
        </button>
      </div>

      {/* right side: icons and user avatar */}
      <div className="flex items-center space-x-4">
        
        {/* notification bell */}
        <button className="p-2 rounded-full hover:bg-zinc-700 transition-colors text-gray-300 relative">
          <AiOutlineBell size={22} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-zinc-900"></span>
        </button>

        {/* theme toggle button */}
        <ThemeToggleButton />

        {/* user avatar linked to /account */}
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
  );
};

export default Header;