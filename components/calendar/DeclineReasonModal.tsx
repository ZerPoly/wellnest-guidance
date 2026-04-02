'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface DeclineReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isProcessing: boolean;
}

export default function DeclineReasonModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}: DeclineReasonModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-[var(--bg-light)] rounded-2xl shadow-2xl border border-[var(--outline)] p-6 max-w-sm w-full animate-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <AlertCircle size={24} />
          <h3 className="text-lg font-bold">Decline Request</h3>
        </div>

        <p className="text-sm text-[var(--text-muted)] mb-4">
          Please provide a reason for declining this appointment. This will be sent to the student.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            autoFocus
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., I have a conflicting seminar at this time..."
            className="w-full h-32 p-3 rounded-xl bg-[var(--bg)] border border-[var(--outline)] text-sm text-[var(--title)] focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-xl border border-[var(--outline)] text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg)] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !reason.trim()}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-extrabold hover:bg-red-700 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {isProcessing ? 'Sending...' : 'Confirm Decline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}