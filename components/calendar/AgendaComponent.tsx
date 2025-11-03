// components/appointments/AgendaComponent.tsx
'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types'; // Use your agenda.types.ts

interface AgendaComponentProps {
    agendas: AgendaData[];
    onAgendaClick: (agenda: AgendaData) => void;
    onCreateAgenda: () => void;
}

// Helper to format status for display
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

export default function AgendaComponent({ 
    agendas, 
    onAgendaClick, 
    onCreateAgenda 
}: AgendaComponentProps) {
    const [filter, setFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');

    // ⬇️ --- CORRECTED/FILLED-IN LOGIC --- ⬇️

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const filterAgendas = () => {
        // This filters the agendas based on the selected tab
        return agendas.filter(agenda => {
            const agendaDate = new Date(agenda.date + 'T00:00:00'); // Use local time
            
            switch (filter) {
                case 'today': return agendaDate.getTime() === today.getTime();
                case 'tomorrow': return agendaDate.getTime() === tomorrow.getTime();
                case 'week': return agendaDate >= today && agendaDate <= weekFromNow;
                case 'all': default: return agendaDate >= today;
            }
        }).sort((a, b) => {
            // This sorts them by date, then by time
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
        });
    };

    const filteredAgendas = filterAgendas(); // This now contains the filtered list
    
    // This function now correctly groups the filtered agendas into an object
    const groupedAgendas = () => {
        const groups: { [key: string]: AgendaData[] } = {}; // ⬅️ Initialize as an object
        filteredAgendas.forEach(agenda => {
            if (!groups[agenda.date]) { groups[agenda.date] = []; }
            groups[agenda.date].push(agenda);
        });
        return groups; // ⬅️ Return the object
    };
    
    // This logic determines *if* we should show the date labels
    const shouldShowDateLabels = filter === 'week' || filter === 'all';
    
    // This line is now safe:
    // - If shouldShowDateLabels is true, agendasByDate becomes a { ... } object
    // - If false, it becomes an empty {}, which Object.keys can safely handle
    const agendasByDate = shouldShowDateLabels ? groupedAgendas() : {};

    // ⬆️ --- END OF CORRECTED LOGIC --- ⬆️

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Consultations</h2>
                <button
                    onClick={onCreateAgenda}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'All Upcoming' },
                    { key: 'today', label: 'Today' },
                    { key: 'tomorrow', label: 'Tomorrow' },
                    { key: 'week', label: 'This Week' },
                ].map((btn) => (
                    <button
                        key={btn.key}
                        onClick={() => setFilter(btn.key as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
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
                        {/* ... (SVG Placeholder) ... */}
                        <p className="text-gray-500 font-medium">No schedules found</p>
                    </div>
                ) : shouldShowDateLabels ? (
                    // Show grouped agendas
                    // This line is now safe, as agendasByDate is always an object
                    Object.keys(agendasByDate).map((date) => {
                        const agendaDate = new Date(date + 'T00:00:00');
                        const isToday = agendaDate.getTime() === today.getTime();
                        const isTomorrow = agendaDate.getTime() === tomorrow.getTime();
                        
                        let dateLabel = '';
                        if (isToday) { dateLabel = 'Today'; } 
                        else if (isTomorrow) { dateLabel = 'Tomorrow'; } 
                        else { 
                            dateLabel = agendaDate.toLocaleDateString('en-US', { 
                                weekday: 'long', month: 'long', day: 'numeric',
                                year: agendaDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                            });
                        }
                        
                        return (
                            <div key={date}>
                                <div className="sticky top-0 bg-white py-2 mb-3 border-b-2 border-purple-200 z-10">
                                    <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide">
                                        {dateLabel}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {agendaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    {agendasByDate[date].map((agenda) => {
                                        const colors = agendaColors[agenda.type] || agendaColors['Default'];
                                        const statusBadge = getStatusBadge(agenda.status);
                                        
                                        return (
                                            <div
                                                key={agenda.id}
                                                onClick={() => onAgendaClick(agenda)}
                                                className={`p-4 rounded-xl border-l-4 ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                                        <h3 className="font-bold text-gray-800">{agenda.student_name}</h3>
                                                        
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadge.className}`}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm font-medium ${colors.text} mb-2`}>
                                                        {agenda.type}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="font-medium">{agenda.startTime} - {agenda.endTime}</span>
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
                    // Show agendas without date labels
                    filteredAgendas.map((agenda) => {
                        const colors = agendaColors[agenda.type] || agendaColors['Default'];
                        const statusBadge = getStatusBadge(agenda.status);

                        return (
                            <div
                                key={agenda.id}
                                onClick={() => onAgendaClick(agenda)}
                                className={`p-4 rounded-xl border-l-4 ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition`}
                            >
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                        <h3 className="font-bold text-gray-800">{agenda.student_name}</h3>

                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadge.className}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>
                                    <p className={`text-sm font-medium ${colors.text} mb-2`}>
                                        {agenda.type}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="font-medium">{agenda.startTime} - {agenda.endTime}</span>
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