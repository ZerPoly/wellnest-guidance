// components/appointments/agendacomponent.tsx
'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types'; // use your agenda.types.ts

interface AgendaComponentProps {
  agendas: AgendaData[];
  onAgendaClick: (agenda: AgendaData) => void;
  onCreateAgenda: () => void;
}

// helper to format status for display
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-green-200 text-green-800' };
    case 'pending':
      return { label: 'Pending', className: 'bg-yellow-200 text-yellow-800' };
    case 'declined':
      return { label: 'Declined', className: 'bg-red-200 text-red-800' };
    default:
      return { label: 'Scheduled', className: 'bg-gray-200 text-gray-800' };
  }
};

const getCounselorStatusBadge = (agenda: AgendaData) => {
  const { status, created_by, student_response } = agenda;
  if (status === 'confirmed') return { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700' };
  if (status === 'declined') {
    return student_response === 'declined' 
      ? { label: 'Declined by Student', className: 'bg-red-100 text-red-700' }
      : { label: 'Declined by You', className: 'bg-red-100 text-red-700' };
  }
  if (status === 'pending') {
    return created_by === 'counselor'
      ? { label: 'Pending Student', className: 'bg-amber-100 text-amber-700' }
      : { label: 'Pending Your Reply', className: 'bg-amber-100 text-amber-700' };
  }
  return { label: 'Scheduled', className: 'bg-[var(--bg)] text-[var(--text-muted)]' };
};

export default function AgendaComponent({ 
  agendas, 
  onAgendaClick, 
  onCreateAgenda 
}: AgendaComponentProps) {
  const [filter, setFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const filterAgendas = () => {
    // this filters the agendas based on the selected tab
    return agendas.filter(agenda => {
      const agendaDate = new Date(agenda.date + 'T00:00:00'); // use local time
      
      switch (filter) {
        case 'today': return agendaDate.getTime() === today.getTime();
        case 'tomorrow': return agendaDate.getTime() === tomorrow.getTime();
        case 'week': return agendaDate >= today && agendaDate <= weekFromNow;
        case 'all': default: return agendaDate >= today;
      }
    }).sort((a, b) => {
      // this sorts them by date, then by time
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const filteredAgendas = filterAgendas(); // this now contains the filtered list
  
  // this function now correctly groups the filtered agendas into an object
  const groupedAgendas = () => {
    const groups: { [key: string]: AgendaData[] } = {}; 
    filteredAgendas.forEach(agenda => {
      if (!groups[agenda.date]) { groups[agenda.date] = []; }
      groups[agenda.date].push(agenda);
    });
    return groups; 
  };
  
  // this logic determines *if* we should show the date labels
  const shouldShowDateLabels = filter === 'week' || filter === 'all';
  
  // this line is now safe:
  // - if shouldshowdatelabels is true, agendasbydate becomes a { ... } object
  // - if false, it becomes an empty {}, which object.keys can safely handle
  const agendasByDate = shouldShowDateLabels ? groupedAgendas() : {};

  return (
    <div className="bg-[var(--bg-light)] rounded-2xl border border-[var(--outline)] shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--title)]">Consultations</h2>
        <button onClick={onCreateAgenda} className="p-2 bg-[var(--cyan)] text-white rounded-lg hover:bg-[var(--cyan-dark)] transition active:scale-95 shadow-lg shadow-[var(--cyan)]/20">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {[{k:'all', l:'All Upcoming'}, {k:'today', l:'Today'}, {k:'tomorrow', l:'Tomorrow'}, {k:'week', l:'This Week'}].map((btn) => (
          <button
            key={btn.k}
            onClick={() => setFilter(btn.k as any)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${filter === btn.k ? 'bg-[var(--cyan)] text-white shadow-md' : 'bg-[var(--bg)] text-[var(--text-muted)] hover:bg-[var(--outline)] border border-[var(--outline)]'}`}
          >
            {btn.l}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredAgendas.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg)] rounded-xl border border-dashed border-[var(--outline)]">
            <p className="text-[var(--text-muted)] font-medium">No schedules found</p>
          </div>
        ) : (
          Object.keys(agendasByDate).map((date) => {
            const d = new Date(date + 'T00:00:00');
            return (
              <div key={date}>
                <div className="sticky top-0 bg-[var(--bg-light)] py-2 mb-3 border-b border-[var(--outline)] z-10">
                  <h3 className="text-sm font-bold text-[var(--cyan)] uppercase tracking-wide">
                    {date === today.toISOString().split('T')[0] ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                </div>
                <div className="space-y-3 mb-6">
                  {agendasByDate[date].map((agenda) => {
                    const colors = agendaColors[agenda.type] || { border: 'border-[var(--cyan)]', dot: 'bg-[var(--cyan)]', text: 'text-[var(--cyan)]' };
                    const badge = getCounselorStatusBadge(agenda);
                    return (
                      <div key={agenda.id} onClick={() => onAgendaClick(agenda)} className={`p-4 rounded-xl border border-[var(--outline)] border-l-4 ${colors.border} bg-[var(--bg)] cursor-pointer hover:shadow-md transition`}>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            <h3 className="font-bold text-[var(--title)]">{agenda.student_name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${badge.className}`}>{badge.label}</span>
                          </div>
                          <p className={`text-sm font-medium ${colors.text} mb-2 opacity-80`}>{agenda.type}</p>
                          <div className="text-sm text-[var(--text-muted)] font-medium">{agenda.startTime} - {agenda.endTime}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}