'use client';

import React from 'react';
import { X, User, Mail, Briefcase, Calendar, Hash } from 'lucide-react';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any | null;
}

export default function UserDetailsModal({ isOpen, onClose, data }: UserDetailsModalProps) {
  if (!isOpen || !data) return null;

  const details = [
    { label: 'Full Name', value: data.name, icon: <User size={16} /> },
    { label: 'Email Address', value: data.email, icon: <Mail size={16} /> },
    { label: 'Department / Program', value: data.department, icon: <Briefcase size={16} /> },
    { label: 'Year Level', value: data.year_level || data.year || 'N/A', icon: <Calendar size={16} /> },
    { label: 'User ID', value: data.user_id || data.id, icon: <Hash size={16} /> },
  ];

  return (
    // added h-[100dvh] w-screen to force full coverage
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 h-[100dvh] w-screen">
      {/* backdrop: added w-full h-full */}
      <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* modal container */}
      <div className="relative w-full max-w-lg bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--line)] animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        
        {/* header */}
        <div className="bg-[var(--background-dark)] p-5 border-b border-[var(--line)] flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-[var(--title)]">User Profile</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--line)] rounded-full transition-colors text-[var(--foreground-muted)]">
            <X size={18} />
          </button>
        </div>

        {/* scrollable content */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* details grid */}
          <div className="grid gap-3">
            {details.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background-dark)] border border-[var(--line)]">
                <div className="text-[var(--cyan)] shrink-0">{item.icon}</div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[var(--foreground-muted)] mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-[var(--title)] break-all leading-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="p-5 bg-[var(--background-dark)]/50 border-t border-[var(--line)] shrink-0">
          <button 
            onClick={onClose} 
            className="w-full py-2.5 bg-[var(--cyan)] text-white font-bold rounded-xl shadow-md hover:bg-[var(--cyan-dark)] transition-all active:scale-95 text-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}