'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Trash2, Calendar, Clock, Bookmark, AlertCircle, ArrowLeft } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types';
import { toast } from 'sonner';

interface AgendaDetailsModalProps {
  agenda: AgendaData | null;
  onClose: () => void;
  onAccept?: (agenda: AgendaData) => Promise<any>;
  onDecline?: (agenda: AgendaData, reason: string) => Promise<any>;
  onCancel?: (agenda: AgendaData) => Promise<any>;
}

export default function AgendaDetailsModal({
  agenda,
  onClose,
  onAccept,
  onDecline,
  onCancel,
}: AgendaDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  if (!agenda) return null;

  // --- Logic Helpers ---
  const colors = agendaColors[agenda.type] || { 
    border: 'border-[var(--cyan)]', 
    bg: 'bg-[var(--cyan)]/5', 
    dot: 'bg-[var(--cyan)]', 
    text: 'text-[var(--cyan)]' 
  };
  
  const isPending = agenda.status === 'pending';
  const isConfirmed = agenda.status === 'confirmed' || agenda.status === 'both_confirmed';
  const createdByStudent = agenda.created_by === 'student';
  const requiresCounselorConfirmation = isPending && createdByStudent;
  const canBeCancelled = isConfirmed;

  const handleAction = async (actionFn: Function, args: any[] = [], confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;

    setIsProcessing(true);
    try {
      await actionFn(agenda, ...args);
      onClose(); 
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = () => handleAction(onAccept!);
  const handleConfirmDecline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineReason.trim()) return;
    handleAction(onDecline!, [declineReason]);
  };
  const handleCancel = () => handleAction(onCancel!, [], 'Are you sure you want to cancel this appointment?');

  const getCounselorStatusBadge = (agenda: AgendaData) => {
    const { status, created_by, student_response } = agenda;
    if (status === 'confirmed' || status === 'both_confirmed') {
      return { label: '✓ Confirmed', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
    }
    if (status === 'declined') {
      const label = student_response === 'declined' ? '✗ Declined by Student' : '✗ Declined by You';
      return { label, className: 'bg-red-100 text-red-700 border border-red-200' };
    }
    if (status === 'pending') {
      const label = created_by === 'counselor' ? '⏳ Pending Student' : '⏳ Pending Your Reply';
      return { label, className: 'bg-amber-100 text-amber-700 border border-amber-200' };
    }
    return { label: `? ${status}`, className: 'bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--outline)]' };
  };

  const statusBadge = getCounselorStatusBadge(agenda);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--bg-light)] rounded-2xl shadow-xl border border-[var(--outline)] p-6 max-w-md w-full overflow-hidden transition-all duration-300">
        
        {/* --- View 1: Appointment Details --- */}
        {!showDeclineForm ? (
          <div className="animate-in slide-in-from-left-4 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                  <h2 className="text-xl font-bold text-[var(--title)] leading-none">
                    {agenda.student_name || 'Appointment'}
                  </h2>
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--title)] p-1 hover:bg-[var(--bg)] rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[var(--bg)] rounded-xl border border-[var(--outline)] p-5 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-[var(--bg-light)] rounded-lg border border-[var(--outline)]">
                  <Bookmark className={`${colors.text}`} size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">Type</p>
                  <p className={`${colors.text} font-bold text-sm`}>{agenda.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-[var(--bg-light)] rounded-lg border border-[var(--outline)]">
                  <Calendar className="text-[var(--cyan)]" size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">Date</p>
                  <p className="text-[var(--title)] font-bold text-sm">
                    {new Date(agenda.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-[var(--bg-light)] rounded-lg border border-[var(--outline)]">
                  <Clock className="text-[var(--cyan)]" size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold mb-1">Time</p>
                  <p className="text-[var(--title)] font-bold text-sm">
                    {agenda.startTime} - {agenda.endTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {requiresCounselorConfirmation && onAccept && onDecline && (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Accept Request
                  </button>
                  <button
                    onClick={() => setShowDeclineForm(true)}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Decline Request
                  </button>
                </div>
              )}
              
              {canBeCancelled && onCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg)] border border-[var(--outline)] text-[var(--text-muted)] font-medium hover:bg-[var(--outline)] transition disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        ) : (
          /* --- View 2: Decline Reason Form --- */
          <div className="animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setShowDeclineForm(false)} 
                className="p-1.5 hover:bg-[var(--bg)] rounded-full text-[var(--text-muted)]"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-xl font-bold text-red-600">Reason for Decline</h2>
            </div>

            <form onSubmit={handleConfirmDecline} className="space-y-5">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs text-red-700 leading-relaxed">
                  Provide a brief explanation why the request is being declined. This will be visible to the student.
                </p>
              </div>

              <textarea
                autoFocus
                required
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., I have a conflicting seminar or please reschedule..."
                className="w-full h-32 p-4 rounded-xl bg-[var(--bg)] border border-[var(--outline)] text-sm text-[var(--title)] focus:ring-1 focus:ring-red-500 outline-none resize-none transition-all"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeclineForm(false)}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl border border-[var(--outline)] text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg)] transition disabled:opacity-50"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !declineReason.trim()}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- Bottom Status Loader --- */}
        {isProcessing && (
          <div className="mt-6 pt-4 border-t border-[var(--outline)] text-center animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <div className="h-4 w-4 border-2 border-[var(--cyan)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] text-[var(--text-muted)] font-bold">UPDATING AGENDA...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}