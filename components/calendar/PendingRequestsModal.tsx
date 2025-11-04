// components/calendar/PendingRequestsModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Inbox } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types';

// We can re-use the badge logic from your other components
const getCounselorStatusBadge = (agenda: AgendaData) => {
  const { status, created_by, student_response } = agenda;

  if (status === 'confirmed' || status === 'both_confirmed') {
    return { label: 'Confirmed', className: 'bg-green-200 text-green-800' };
  }
  if (status === 'declined') {
    if (student_response === 'declined') {
      return { label: 'Declined by Student', className: 'bg-red-200 text-red-800' };
    }
    return { label: 'Declined by You', className: 'bg-red-200 text-red-800' };
  }
  if (status === 'pending') {
    if (created_by === 'counselor') {
      return { label: 'Pending Student', className: 'bg-yellow-200 text-yellow-800' };
    }
    return { label: 'Pending Your Reply', className: 'bg-yellow-200 text-yellow-800' };
  }
  return { label: `? ${status}`, className: 'bg-gray-200 text-gray-700' };
};

interface PendingRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendas: AgendaData[]; // This will be the 'listAgendas'
  onAgendaClick: (agenda: AgendaData) => void;
}

// Define Tab Type
type RequestTab = 'pending' | 'declined';

export default function PendingRequestsModal({
  isOpen,
  onClose,
  agendas,
  onAgendaClick,
}: PendingRequestsModalProps) {
  // ⬇️ --- ADD STATE FOR TABS --- ⬇️
  const [activeTab, setActiveTab] = useState<RequestTab>('pending');
  
  if (!isOpen) return null;

  // 1. Sort agendas by date and time
  const sortedAgendas = agendas.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  // 2. Filter into the two lists we care about
  const pendingRequests = sortedAgendas.filter(a => a.status === 'pending');
  const declinedRequests = sortedAgendas.filter(a => a.status === 'declined');

  const dataToDisplay = activeTab === 'pending' ? pendingRequests : declinedRequests;
  const listTitle = activeTab === 'pending' ? 'Pending Requests' : 'Declined Requests';
  const listColor = activeTab === 'pending' ? 'text-yellow-600' : 'text-red-600';

  // Component for Tab Buttons (copied from ConsultationTable logic)
  const TabButton: React.FC<{ tab: RequestTab, label: string, count: number }> = ({ tab, label, count }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors flex items-center gap-1 ${
          isActive 
            ? 'bg-purple-600 text-white shadow-md' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {label}
        <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white text-purple-600' : 'bg-gray-300 text-gray-800'}`}>
          {count}
        </span>
      </button>
    );
  };
  // ⬆️ --- END OF TAB LOGIC --- ⬆️


  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Request Inbox</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors rounded-full"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- ⬇️ Tab Control ⬇️ --- */}
        <div className="flex space-x-3 mb-6 border-b pb-3">
          <TabButton tab="pending" label="Pending" count={pendingRequests.length} />
          <TabButton tab="declined" label="Declined" count={declinedRequests.length} />
        </div>
        {/* --- ⬆️ End Tab Control ⬆️ --- */}

        {/* --- List Content --- */}
        <div className={`overflow-y-auto space-y-4 flex-1`}>
          
          <h3 className={`text-sm font-bold uppercase tracking-wide ${listColor}`}>
            {listTitle}
          </h3>

          {dataToDisplay.length > 0 ? (
            <div className="space-y-3">
              {dataToDisplay.map((agenda) => {
                const colors = agendaColors[agenda.type] || agendaColors['Default'];
                const statusBadge = getCounselorStatusBadge(agenda);
                
                return (
                  <div
                    key={agenda.id}
                    onClick={() => {
                      onAgendaClick(agenda);
                    }}
                    className={`p-4 rounded-xl border-l-4 ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      <h4 className="font-bold text-gray-800">{agenda.student_name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${colors.text} mb-2`}>{agenda.type}</p>
                    <div className="text-sm text-gray-600">
                      <span>{new Date(agenda.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                      <span className="mx-2">|</span>
                      <span>{agenda.startTime} - {agenda.endTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Inbox size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 italic">No {listTitle.toLowerCase()} at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}