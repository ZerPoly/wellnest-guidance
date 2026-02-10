'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { IoChatbubblesOutline } from "react-icons/io5";
import { AiOutlineFilter } from "react-icons/ai";
import { getCounselorConfirmedAppointments } from '@/lib/api/appointments/counselorAppointments';
import { Appointment } from '@/lib/api/appointments/types';
import { isSameWeek, isSameMonth } from 'date-fns';

interface Consultation {
  id: string;
  sessionType: 'Counseling' | 'Routine Interview' | 'Meeting' | 'Event';
  time: string;
  date: string;
  rawDate: Date;
}

const mapAgendaToSessionType = (agenda: string): Consultation['sessionType'] => {
  switch (agenda) {
    case 'counseling': return 'Counseling';
    case 'routine_interview': return 'Routine Interview';
    case 'meeting': return 'Meeting';
    case 'event': return 'Event';
    default: return 'Counseling';
  }
};

const getBadgeClasses = (type: Consultation['sessionType']) => {
  switch (type) {
    case 'Counseling': return 'bg-teal-100 text-teal-700 border-teal-200';
    case 'Routine Interview': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'Meeting': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Event': return 'bg-pink-100 text-pink-700 border-pink-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const AppointmentHistory: React.FC<{ studentId: string }> = ({ studentId }) => {
  const { data: session } = useSession();
  const accessToken = session?.counselorToken || session?.adminToken;

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<string>('All Time');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchStudentAppointments();
    }
  }, [accessToken, studentId]);

  const fetchStudentAppointments = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const result = await getCounselorConfirmedAppointments(
        accessToken!,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (result.success && result.data) {
        const filtered = result.data
          .filter((app: Appointment) => app.student_id === studentId)
          .map((app: Appointment) => {
            const start = new Date(app.start_time);
            return {
              id: app.appointment_id,
              sessionType: mapAgendaToSessionType(app.agenda),
              date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              rawDate: start
            };
          })
          .sort((a: any, b: any) => b.rawDate.getTime() - a.rawDate.getTime());

        setConsultations(filtered);
      }
    } catch (err) {
      console.error('failed to load student consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    return consultations.filter(item => {
      const matchesType = typeFilter === 'All' || item.sessionType === typeFilter;
      
      let matchesTime = true;
      if (timeFilter === 'This Week') {
        matchesTime = isSameWeek(item.rawDate, now);
      } else if (timeFilter === 'This Month') {
        matchesTime = isSameMonth(item.rawDate, now);
      }

      return matchesType && matchesTime;
    });
  }, [consultations, typeFilter, timeFilter]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <IoChatbubblesOutline size={24} className="text-[#460F9D]" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Appointment Records</h3>
            <p className="text-sm text-gray-500">History of all attended sessions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowTimeDropdown(false); }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-purple-400 transition-all"
            >
              <AiOutlineFilter size={14} />
              {typeFilter}
            </button>
            {showTypeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1">
                {['All', 'Counseling', 'Routine Interview', 'Meeting', 'Event'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setTypeFilter(opt); setShowTypeDropdown(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowTimeDropdown(!showTimeDropdown); setShowTypeDropdown(false); }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-purple-400 transition-all"
            >
              {timeFilter}
            </button>
            {showTimeDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1">
                {['All Time', 'This Week', 'This Month'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setTimeFilter(opt); setShowTimeDropdown(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400 animate-pulse">loading records...</div>
      ) : filteredData.length === 0 ? (
        <div className="py-10 text-center text-gray-500 italic">
          no appointment records found for the selected filters.
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[380px] pr-2 custom-scrollbar border rounded-xl border-gray-100">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Session Type</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`group transition-all duration-200 cursor-default ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                  } hover:bg-purple-100/50 hover:shadow-inner`}
                >
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700 group-hover:text-[#460F9D]">{item.date}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase transition-transform group-hover:scale-105 ${getBadgeClasses(item.sessionType)}`}>
                      {item.sessionType}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 font-medium group-hover:text-gray-900">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;