'use client';

import React, { useState } from 'react';
import { X, Clock, XCircle, Inbox } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types';

const getCounselorStatusBadge = (agenda: AgendaData) => {
  const { status, created_by, student_response } = agenda;

  if (status === 'confirmed' || status === 'both_confirmed') {
    return { label: 'Confirmed', className: 'bg-green-100 text-green-700' };
  }
  if (status === 'declined') {
    if (student_response === 'declined') {
      return { label: 'Declined by Student', className: 'bg-red-100 text-red-700' };
    }
    return { label: 'Declined by You', className: 'bg-red-100 text-red-700' };
  }
  if (status === 'pending') {
    if (created_by === 'counselor') {
      return { label: 'Pending Student', className: 'bg-yellow-100 text-yellow-700' };
    }
    return { label: 'Pending Your Reply', className: 'bg-yellow-100 text-yellow-700' };
  }
  return { label: `? ${status}`, className: 'bg-[var(--bg)] text-[var(--text-muted)]' };
};

interface PendingRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendas: AgendaData[]; 
  onAgendaClick: (agenda: AgendaData) => void;
}

type RequestTab = 'pending' | 'declined';

const groupByDate = (list: AgendaData[]) => {
  const groups: { [key: string]: AgendaData[] } = {};
  list.forEach(item => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  });
  return groups;
};

export default function PendingRequestsModal({
  isOpen,
  onClose,
  agendas = [],
  onAgendaClick,
}: PendingRequestsModalProps) {
  const [activeTab, setActiveTab] = useState<RequestTab>('pending');
  
  if (!isOpen) return null;

  const dataToDisplay = agendas
    .filter(a => a.status === activeTab)
    .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime));

  const pendingCount = agendas.filter(a => a.status === 'pending').length;
  const declinedCount = agendas.filter(a => a.status === 'declined').length;

  const renderCategorizedList = (list: AgendaData[]) => {
    const grouped = groupByDate(list);
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return sortedDates.map(date => {
      const d = new Date(date + 'T00:00:00');
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const subLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return (
        <div key={date} className="mb-8 last:mb-0">
          <div className="mb-4">
            <h3 className="text-base font-black text-[var(--cyan)] tracking-tight">{dayLabel}</h3>
            <p className="text-xs text-[var(--text-muted)] font-medium">{subLabel}</p>
            <div className="h-[1px] bg-[var(--outline)] w-full mt-2 opacity-50" />
          </div>

          <div className="grid gap-3">
            {grouped[date].map((agenda) => {
              const badge = getCounselorStatusBadge(agenda);
              return (
                <div 
                  key={agenda.id} 
                  onClick={() => { onAgendaClick(agenda); onClose(); }} 
                  className="p-4 bg-[var(--bg)] border border-[var(--outline)] rounded-xl cursor-pointer hover:border-[var(--cyan)] transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-extrabold text-[var(--title)] text-base group-hover:text-[var(--cyan)] transition-colors">
                        {agenda.student_name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-bold">
                        {agenda.startTime} - {agenda.endTime} | {agenda.type}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[var(--bg-light)] border border-[var(--outline)] rounded-2xl shadow-xl flex flex-col max-w-lg w-full max-h-[85vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-[var(--outline)] shrink-0">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-black text-[var(--title)]">Request Inbox</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-2 text-xs font-bold rounded-full border transition-all ${
                  activeTab === 'pending' 
                  ? 'bg-[var(--cyan)] text-white border-[var(--cyan)] shadow-lg shadow-[var(--cyan)]/20' 
                  : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--outline)] hover:bg-[var(--outline)]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('declined')}
                className={`px-6 py-2 text-xs font-bold rounded-full border transition-all ${
                  activeTab === 'declined' 
                  ? 'bg-[var(--cyan)] text-white border-[var(--cyan)] shadow-lg shadow-[var(--cyan)]/20' 
                  : 'bg-[var(--bg-light)] text-[var(--text-muted)] border-[var(--outline)] hover:bg-[var(--outline)]'
                }`}
              >
                Declined ({declinedCount})
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--title)] p-1 transition-colors self-start">
            <X size={26} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto hide-scrollbar">
          <div className="space-y-10">
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-[var(--outline)] pb-2">
                {activeTab === 'pending' ? <Clock className="text-amber-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
                <h3 className="text-base font-black text-[var(--title)]">
                  {activeTab === 'pending' ? 'Pending Requests' : 'Declined Requests'}
                </h3>
              </div>
              
              {dataToDisplay.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] italic py-2">
                  No {activeTab} records found.
                </p>
              ) : (
                renderCategorizedList(dataToDisplay)
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}