'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Trash2, Calendar, Clock, Bookmark } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types';
import { toast } from 'sonner';

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

interface AgendaDetailsModalProps {
  agenda: AgendaData | null;
  onClose: () => void;
  onAccept?: (agenda: AgendaData) => Promise<any>; 
  onDecline?: (agenda: AgendaData) => Promise<any>; 
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

  if (!agenda) return null;

  // Use thesis variable var(--cyan) for default branding
  const colors = agendaColors[agenda.type] || { border: 'border-[var(--cyan)]', bg: 'bg-[var(--cyan)]/5', dot: 'bg-[var(--cyan)]', text: 'text-[var(--cyan)]' };
  
  const isPending = agenda.status === 'pending';
  const isConfirmed = agenda.status === 'confirmed' || agenda.status === 'both_confirmed';
  
  const createdByStudent = agenda.created_by === 'student';
  const requiresCounselorConfirmation = isPending && createdByStudent;
  const canBeCancelled = isConfirmed; 

  const handleAction = async (actionFn: (agenda: AgendaData) => Promise<any>, confirmText?: string) => {
    if (!actionFn) {
      toast.error('Error: Action is not configured.');
      return;
    }
    
    if (confirmText && !window.confirm(confirmText)) { return; }

    setIsProcessing(true);
    try {
      await actionFn(agenda);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = () => handleAction(onAccept!);
  const handleDecline = () => handleAction(onDecline!);
  const handleCancel = () => handleAction(onCancel!, 'Are you sure you want to cancel this appointment?');

  const statusBadge = getCounselorStatusBadge(agenda);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--bg-light)] rounded-2xl shadow-xl border border-[var(--outline)] p-6 max-w-md w-full">
        
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
              <h2 className="text-xl font-bold text-[var(--title)] leading-none">
                {agenda.student_name || 'Appointment'}
              </h2>
            </div>
            {agenda.status && (
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--title)] p-1 hover:bg-[var(--bg)] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- Details Body Card --- */}
        <div className="bg-[var(--bg)] rounded-xl border border-[var(--outline)] p-5 space-y-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--bg-light)] rounded-lg border border-[var(--outline)]">
              <Bookmark className={`${colors.text}`} size={18} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Type</p>
              <p className={`${colors.text} font-bold`}>{agenda.type}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--bg-light)] rounded-lg border border-[var(--outline)]">
              <Calendar className="text-[var(--cyan)]" size={18} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Date</p>
              <p className="text-[var(--title)] font-bold">
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
              <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest mb-1">Time</p>
              <p className="text-[var(--title)] font-bold">
                {agenda.startTime} - {agenda.endTime}
              </p>
            </div>
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="mt-8 space-y-3">
          {requiresCounselorConfirmation && onAccept && onDecline && (
            <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--outline)] mb-2">
              <p className="text-xs text-[var(--text-muted)] font-bold pb-3 italic text-center">Student is awaiting your confirmation:</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Accept Request
                </button>
                <button
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-extrabold hover:bg-red-700 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Decline Request
                </button>
              </div>
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

        {/* --- Loading State --- */}
        {isProcessing && (
          <div className="mt-6 pt-4 border-t border-[var(--outline)] text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--cyan)]"></div>
              <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}