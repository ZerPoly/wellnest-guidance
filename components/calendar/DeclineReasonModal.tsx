'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface DeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isProcessing: boolean;
}

export default function DeclineModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}: DeclineModalProps) {
  const [reason, setReason] = useState('');

  // Clear the reason field every time the modal opens or closes
  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason || isProcessing) return;
    
    // Pass the reason up to the parent component
    onConfirm(trimmedReason);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-[var(--bg-light)] rounded-2xl shadow-2xl border border-[var(--outline)] p-6 max-w-sm w-full animate-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle size={24} />
            <h3 className="text-lg font-black tracking-tight uppercase">Decline Appointment</h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] font-bold mb-4 leading-relaxed">
          Please provide a reason for declining this request. This will notify your counselor.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              autoFocus
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., I have a class at this time, can we reschedule?"
              className="w-full h-32 p-4 rounded-xl bg-[var(--bg)] border border-[var(--outline)] text-sm text-[var(--title)] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none transition-all font-medium"
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-black text-[var(--text-muted)] opacity-50">
              {reason.length} characters
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-xl border border-[var(--outline)] text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg)] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !reason.trim()}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {isProcessing ? 'Sending...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}