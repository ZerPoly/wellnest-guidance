// components/appointments/DayAgendasModal.tsx
'use client';

import React from 'react';
import { X, Plus } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types'; // Use your types

interface DayAgendasModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  agendas: AgendaData[];
  onAgendaClick: (agenda: AgendaData) => void;
  onCreateAgenda: () => void;
}

export default function DayAgendasModal({
  isOpen,
  onClose,
  date,
  agendas,
  onAgendaClick,
  onCreateAgenda,
}: DayAgendasModalProps) {
  if (!isOpen) return null;

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative bg-white rounded-2xl shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Agendas for</h2>
            <p className="text-lg font-semibold text-purple-700">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors rounded-full"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {agendas.map((agenda) => {
            const colors = agendaColors[agenda.type] || agendaColors['Default'];

            return (
              <div
                key={agenda.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onAgendaClick(agenda); // This will open the DetailsModal
                }}
                className={`p-4 rounded-xl border-l-4 ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition`}
              >
                {/* ⬇️ --- MODIFIED --- ⬇️ */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  {/* Show student name for counselors */}
                  <h3 className="font-bold text-gray-800">{agenda.student_name}</h3>
                </div>
                {/* ⬆️ --- END MODIFIED --- ⬆️ */}
                
                <p className={`text-sm font-medium ${colors.text} mb-2`}>
                  {agenda.type}
                </p>
                <div className="text-sm text-gray-600">
                  <span>{agenda.startTime} - {agenda.endTime}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateAgenda(); // This will open the CreateModal
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          <Plus size={18} />
          Add New Agenda for This Day
        </button>
      </div>
    </div>
  );
}