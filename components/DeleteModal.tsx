'use client';

import React from 'react';

interface DeleteModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onConfirm:    () => void;
  title?:       string;
  description?: string;
  itemName?:    string; 
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title       = 'Delete',
  description = 'Are you sure you want to delete:',
  itemName,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 h-[100dvh] w-screen">
      {/* Backdrop */}
      <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container - Matches UserDetailsModal structure exactly */}
      <div className="relative w-full max-w-md bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--line)] animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[var(--background-dark)] p-5 border-b border-[var(--line)] flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-red-500">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--line)] rounded-full transition-colors text-[var(--foreground-muted)]">
            {/* Simple SVG X icon so you don't need extra imports */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <p className="text-base text-[var(--foreground-muted)] mb-3">
            {description}
          </p>
          
          {itemName && (
            <p className="text-lg font-bold text-[var(--title)] mb-4 p-3 bg-[var(--background-dark)] rounded-xl border border-[var(--line)]">
              {itemName}
            </p>
          )}
          
          <p className="text-sm text-red-500 mb-2 font-medium">
            This action is permanent and cannot be undone.
          </p>
        </div>

        {/* Footer (Buttons) */}
        <div className="p-5 bg-[var(--background-dark)]/50 border-t border-[var(--line)] shrink-0 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-[var(--foreground-muted)] bg-[var(--background-dark)] border border-[var(--line)] rounded-xl hover:bg-[var(--line)] hover:text-[var(--title)] transition-all"
          >
            Cancel
          </button>
          
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="px-6 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg transition-all active:scale-95"
          >
            Yes, Delete
          </button>
        </div>

      </div>
    </div>
  );
}