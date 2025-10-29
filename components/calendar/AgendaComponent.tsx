'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types';

interface AgendaComponentProps {
  agendas: AgendaData[];
  onAgendaClick: (agenda: AgendaData) => void;
  onCreateAgenda: () => void;
}

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
    return agendas.filter(agenda => {
      const agendaDate = new Date(agenda.date + 'T00:00:00');
      
      switch (filter) {
        case 'today':
          return agendaDate.getTime() === today.getTime();
        case 'tomorrow':
          return agendaDate.getTime() === tomorrow.getTime();
        case 'week':
          return agendaDate >= today && agendaDate <= weekFromNow;
        case 'all':
        default:
          return agendaDate >= today;
      }
    }).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const filteredAgendas = filterAgendas();
  
  // Group agendas by date for "week" and "all" filters
  const groupedAgendas = () => {
    const groups: { [key: string]: AgendaData[] } = {};
    
    filteredAgendas.forEach(agenda => {
      if (!groups[agenda.date]) {
        groups[agenda.date] = [];
      }
      groups[agenda.date].push(agenda);
    });
    
    return groups;
  };
  
  const shouldShowDateLabels = filter === 'week' || filter === 'all';
  const agendasByDate = shouldShowDateLabels ? groupedAgendas() : {};

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Agendas</h2>
        <button
          onClick={onCreateAgenda}
          className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'today', label: 'Today' },
          { key: 'tomorrow', label: 'Tomorrow' },
          { key: 'week', label: 'This Week' },
          { key: 'all', label: 'All Upcoming' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              filter === btn.key
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredAgendas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg 
                className="w-16 h-16 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No agendas found</p>
            <p className="text-gray-400 text-sm mt-1">
              Create a new agenda to get started
            </p>
          </div>
        ) : shouldShowDateLabels ? (
          // Show grouped agendas with date labels for "This Week" and "All Upcoming"
          Object.keys(agendasByDate).map((date) => {
            const agendaDate = new Date(date + 'T00:00:00');
            const isToday = agendaDate.getTime() === today.getTime();
            const isTomorrow = agendaDate.getTime() === tomorrow.getTime();
            
            let dateLabel = '';
            if (isToday) {
              dateLabel = 'Today';
            } else if (isTomorrow) {
              dateLabel = 'Tomorrow';
            } else {
              dateLabel = agendaDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: agendaDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
              });
            }
            
            return (
              <div key={date}>
                {/* Date Label Header */}
                <div className="sticky top-0 bg-white py-2 mb-3 border-b-2 border-purple-200">
                  <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide">
                    {dateLabel}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {agendaDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                {/* Agendas for this date */}
                <div className="space-y-3 mb-6">
                  {agendasByDate[date].map((agenda) => {
                    const colors = agendaColors[agenda.type] || agendaColors['Meeting'];
                    
                    return (
                      <div
                        key={agenda.id}
                        onClick={() => onAgendaClick(agenda)}
                        className={`p-4 rounded-xl border-l-4 ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                              <h3 className="font-bold text-gray-800">{agenda.title}</h3>
                            </div>
                            <p className={`text-sm font-medium ${colors.text} mb-2`}>
                              {agenda.type}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="font-medium">{agenda.startTime} - {agenda.endTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // Show agendas without date labels (for "Today" and "Tomorrow")
          filteredAgendas.map((agenda) => {
            const colors = agendaColors[agenda.type] || agendaColors['Meeting'];
            
            return (
              <div
                key={agenda.id}
                onClick={() => onAgendaClick(agenda)}
                className={`p-4 rounded-xl border-l-4 ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      <h3 className="font-bold text-gray-800">{agenda.title}</h3>
                    </div>
                    <p className={`text-sm font-medium ${colors.text} mb-2`}>
                      {agenda.type}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">{agenda.startTime} - {agenda.endTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}