'use client';

import React from 'react';
import { format, isFuture, isToday } from 'date-fns';
import { AiOutlineClockCircle, AiOutlineMail, AiOutlineUser } from 'react-icons/ai';

// --- Mock Data ---

interface AgendaEvent {
    id: number;
    title: string;
    time: string;
    date: Date;
    type: 'counseling' | 'interview' | 'holiday';
    counselor: string;
    email: string;
}

// Generate mock event data for the list
const getMockDate = (dateString: string) => {
    // Treating dates as future events
    const date = new Date();
    // For demonstration, these dates will be in the near future (e.g., today + offset)
    const [month, day, year] = dateString.split('/').map(Number);
    date.setMonth(month - 1);
    date.setDate(day);
    date.setFullYear(year);
    return date;
};

const mockAgendaEvents: AgendaEvent[] = [
    { id: 1, title: 'Check-in: Anxiety', time: '10:00 AM', date: getMockDate('10/26/2025'), type: 'counseling', counselor: 'Jane Doe', email: 'jane.doe@umak.edu.ph' },
    { id: 2, title: 'Routine Interview', time: '11:30 AM', date: getMockDate('10/26/2025'), type: 'interview', counselor: 'Dr. Smith', email: 'student1@umak.edu.ph' },
    { id: 3, title: 'Holiday Break', time: 'All Day', date: getMockDate('10/27/2025'), type: 'holiday', counselor: 'N/A', email: 'N/A' },
    { id: 4, title: 'Follow-up: Career Goals', time: '2:00 PM', date: getMockDate('10/27/2025'), type: 'counseling', counselor: 'Jane Doe', email: 'student2@umak.edu.ph' },
    { id: 5, title: 'New Student Intake', time: '9:00 AM', date: getMockDate('10/28/2025'), type: 'interview', counselor: 'Dr. Smith', email: 'student3@umak.edu.ph' },
    { id: 6, title: 'Group Therapy Session', time: '4:00 PM', date: getMockDate('10/28/2025'), type: 'counseling', counselor: 'Jane Doe', email: 'student4@umak.edu.ph' },
].sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date

// Map event type to color
const getEventTypeStyle = (type: AgendaEvent['type']) => {
    switch (type) {
        case 'counseling':
            return { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-500' };
        case 'interview':
            return { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-500' };
        case 'holiday':
            return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500' };
    }
};

// --- Sub Component ---

interface AgendaItemProps {
    event: AgendaEvent;
}

const AgendaItem: React.FC<AgendaItemProps> = ({ event }) => {
    const styles = getEventTypeStyle(event.type);
    const dateLabel = isToday(event.date) ? 'Today' : format(event.date, 'MMM do');

    return (
        <div className={`p-3 rounded-xl border-l-4 ${styles.border} ${styles.bg} hover:shadow-md transition-shadow cursor-pointer`}>
            <div className="flex justify-between items-start">
                <p className={`text-sm font-semibold ${styles.text} uppercase`}>{event.type.replace('-', ' ')}</p>
                <p className={`text-xs text-gray-500 flex items-center`}>
                    <AiOutlineClockCircle className="mr-1" /> {dateLabel}, {event.time}
                </p>
            </div>
            <h3 className="text-base font-bold text-[var(--title)] mt-1">{event.title}</h3>
            
            {event.type !== 'holiday' && (
                <div className="mt-2 text-xs space-y-1 text-gray-600">
                    <p className="flex items-center"><AiOutlineUser className="mr-1" /> Counselor: {event.counselor}</p>
                    <p className="flex items-center"><AiOutlineMail className="mr-1" /> Student: {event.email}</p>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

interface AgendaListProps {}

const AgendaList: React.FC<AgendaListProps> = () => {
    return (
        <div className="w-full lg:w-96 flex-shrink-0 border border-[var(--outline)] h-full bg-[var(--bg)] p-6 rounded-2xl shadow-xl flex flex-col">
            <h2 className="text-2xl font-extrabold text-[var(--title)] mb-4">Upcoming Agendas</h2>
            
            {/* Agenda List */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {mockAgendaEvents.map(event => (
                    <AgendaItem key={event.id} event={event} />
                ))}
            </div>

            {/* Total Count */}
            <div className="pt-4 border-t border-zinc-200 mt-4 text-center">
                <p className="text-sm text-gray-600">Showing {mockAgendaEvents.length} events total.</p>
            </div>
        </div>
    );
};

export default AgendaList;
