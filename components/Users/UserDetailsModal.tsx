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
    { label: 'Full Name', value: data.name, icon: <User size={18} /> },
    { label: 'Email Address', value: data.email, icon: <Mail size={18} /> },
    { label: 'Department / Program', value: data.department, icon: <Briefcase size={18} /> },
    { label: 'Year Level', value: data.year_level || data.year || 'N/A', icon: <Calendar size={18} /> },
    { label: 'User ID', value: data.user_id || data.id, icon: <Hash size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--card)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--line)] animate-in zoom-in duration-200">
        <div className="bg-[var(--background-dark)] p-6 border-b border-[var(--line)] flex justify-between items-center">
          <h2 className="text-xl font-black text-[var(--title)]">User Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--line)] rounded-full transition-colors text-[var(--foreground-muted)]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 bg-[var(--cyan)]/10 rounded-full flex items-center justify-center text-[var(--cyan)] mb-3">
              <User size={40} />
            </div>
            <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
              data.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {data.status}
            </span>
          </div>
          <div className="grid gap-4">
            {details.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-2xl bg-[var(--background-dark)]/50 border border-[var(--line)]">
                <div className="text-[var(--cyan)] mt-1">{item.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-[var(--foreground-muted)]">{item.label}</p>
                  <p className="text-sm font-bold text-[var(--title)] break-all">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-[var(--background-dark)]/30 border-t border-[var(--line)]">
          <button onClick={onClose} className="w-full py-3 bg-[var(--cyan)] text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[var(--cyan)]/20 hover:bg-[var(--cyan-dark)] transition-all">
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}