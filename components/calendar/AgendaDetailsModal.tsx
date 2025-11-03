// components/appointments/AgendaDetailsModal.tsx
'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types';
import { toast } from 'sonner';

const getCounselorStatusBadge = (agenda: AgendaData) => {
    const { status, created_by, student_response } = agenda;

    if (status === 'confirmed') {
      return { label: '✓ Confirmed', className: 'bg-green-100 text-green-700' };
    }
    
    if (status === 'declined') {
      if (student_response === 'declined') {
        return { label: '✗ Declined by Student', className: 'bg-red-100 text-red-700' };
      }
      return { label: '✗ Declined by You', className: 'bg-red-100 text-red-700' };
    }

    if (status === 'pending') {
      if (created_by === 'counselor') {
        return { label: '⏳ Pending Student', className: 'bg-yellow-100 text-yellow-700' };
      }
      // If created_by === 'student'
      return { label: '⏳ Pending Your Reply', className: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: `? ${status}`, className: 'bg-gray-100 text-gray-700' };
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

  const colors = agendaColors[agenda.type] || agendaColors['Default'];
  const isPending = agenda.status === 'pending';
  const isConfirmed = agenda.status === 'confirmed';
  
  const createdByStudent = agenda.created_by === 'student';
  const requiresCounselorConfirmation = isPending && createdByStudent;
  const canBeCancelled = isConfirmed; 

  // --- Handlers ---
  const statusBadge = getCounselorStatusBadge(agenda);
  
  const handleAction = async (actionFn: (agenda: AgendaData) => Promise<any>, confirmText?: string) => {
    
    // DEBUG LOGGING
    console.log('[handleAction] Triggered. Do we have a function?', actionFn);
    
    if (!actionFn) {
      console.error('[handleAction] FAILED: The action function is UNDEFINED.');
      toast.error('Error: Action is not configured.');
      return;
    }
    
    if (confirmText && !window.confirm(confirmText)) { return; }

    setIsProcessing(true);
    try {
      await actionFn(agenda);
    } catch (error) {
      console.error('Action failed:', error);
      alert('Operation failed. Please check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = () => {
    console.log('[AgendaDetailsModal] Accept button clicked');
    handleAction(onAccept!);
  };
  
  const handleDecline = () => {
    console.log('[AgendaDetailsModal] Decline button clicked');
    handleAction(onDecline!);
  };

  const handleCancel = () => handleAction(
    onCancel!, 
    'Are you sure you want to cancel this appointment?'
  );


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-lg p-6 max-w-md w-full">
        
        {/* --- ⬇️ CORRECTED HEADER --- */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
            <h2 className="text-xl font-bold text-gray-800">
              {agenda.student_name || 'Appointment'}
            </h2>
          </div>
          {/* This is the 'X' button */}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        {/* --- ⬆️ END HEADER --- */}


        {/* --- ⬇️ CORRECTED STATUS BADGE --- */}
        {/* This was the 'weird yellow object' */}
        {agenda.status && (
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          </div>
        )}
        {/* --- ⬆️ END STATUS BADGE --- */}


        {/* --- Details Body --- */}
        <div className="space-y-3">
          {agenda.student_name && (
            <div>
              <p className="text-sm text-gray-500 font-medium">Student</p>
              <p className="text-gray-800 font-semibold">{agenda.student_name}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-500 font-medium">Type</p>
            <p className={`${colors.text} font-semibold`}>{agenda.type}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 font-medium">Date</p>
            <p className="text-gray-800 font-semibold">
              {new Date(agenda.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 font-medium">Time</p>
            <p className="text-gray-800 font-semibold">
              {agenda.startTime} - {agenda.endTime}
            </p>
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="mt-6 space-y-2">
          
          {requiresCounselorConfirmation && onAccept && onDecline && (
            <>
              <p className="text-sm text-gray-500 font-medium pb-1">Student is awaiting your confirmation:</p>
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                <CheckCircle size={18} />
                Accept Request
              </button>
              <button
                onClick={handleDecline}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                <XCircle size={18} />
                Decline Request
              </button>
            </>
          )}
          
          {canBeCancelled && onCancel && (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Trash2 size={18} />
              Cancel Appointment
            </button>
          )}
        </div>

        {isProcessing && (
          <div className="mt-4 text-center">
             <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600 mt-2">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
}