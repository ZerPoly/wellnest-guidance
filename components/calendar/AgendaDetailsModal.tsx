'use client';

import React from 'react';
import { X } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types';

interface AgendaDetailsModalProps {
  agenda: AgendaData | null;
  onClose: () => void;
  onEdit: (agenda: AgendaData) => void;
  onDelete: (id: number) => void;
}

export default function AgendaDetailsModal({ 
  agenda, 
  onClose, 
  onEdit, 
  onDelete 
}: AgendaDetailsModalProps) {
  if (!agenda) return null;

  const colors = agendaColors[agenda.type] || agendaColors['Meeting'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white rounded-2xl shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
            <h2 className="text-xl font-bold text-gray-800">{agenda.title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
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
                day: 'numeric' 
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

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { 
              onEdit(agenda); 
              onClose(); 
            }}
            className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
          >
            Edit
          </button>
          <button
            onClick={() => { 
              onDelete(agenda.id); 
              onClose(); 
            }}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}