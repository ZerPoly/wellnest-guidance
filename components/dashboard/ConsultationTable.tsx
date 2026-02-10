'use client';

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineSortAscending, AiOutlineCalendar } from 'react-icons/ai';
import { getCounselorConfirmedAppointments } from '@/lib/api/appointments/counselorAppointments';
import { Appointment } from '@/lib/api/appointments/types';

interface Consultation {
  id: string;
  email: string;
  sessionType: 'Counseling' | 'Routine Interview' | 'Meeting' | 'Event';
  time: string;
  date: string;
  rawDate: Date;
}

// update: added props interface to fix typescript error
interface ConsultationsTableProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  sessionTypeFilter: string;
  setSessionTypeFilter: Dispatch<SetStateAction<string>>;
}

type SortKey = 'date' | 'email';
type SortDirection = 'asc' | 'desc';

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
    case 'Counseling': return 'bg-teal-400 text-teal-900';
    case 'Routine Interview': return 'bg-indigo-600 text-indigo-100';
    case 'Meeting': return 'bg-purple-50 text-purple-100';
    case 'Event': return 'bg-pink-500 text-pink-100';
    default: return 'bg-gray-200 text-gray-800';
  }
};

// update: updated component signature to accept props
const ConsultationsTable: React.FC<ConsultationsTableProps> = ({
  searchQuery,
  setSearchQuery,
  sessionTypeFilter,
  setSessionTypeFilter
}) => {
  const { data: session } = useSession();
  const accessToken = session?.counselorToken || session?.adminToken;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous'>('upcoming');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchAppointments();
    }
  }, [accessToken]);

  const fetchAppointments = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const result = await getCounselorConfirmedAppointments(
        accessToken,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (result.success && result.data) {
        const transformedData: Consultation[] = result.data.map((appointment: Appointment) => {
          const startTime = new Date(appointment.start_time);
          const date = startTime.toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
          });
          const time = startTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          });

          const email = `student-${appointment.student_id.substring(0, 8)}@umak.edu.ph`;

          return {
            id: appointment.appointment_id,
            email,
            sessionType: mapAgendaToSessionType(appointment.agenda),
            time,
            date,
            rawDate: startTime,
          };
        });

        setConsultations(transformedData);
      } else {
        setError(result.message || 'failed to load consultations');
      }
    } catch (err) {
      setError('failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingConsultations = consultations.filter(c => c.rawDate >= now);
  const previousConsultations = consultations.filter(c => c.rawDate < now);

  const displayData = activeTab === 'upcoming' ? upcomingConsultations : previousConsultations;
  
  // note: filtering logic now uses the incoming sessiontypefilter
  let filteredData = displayData.filter(c => {
    const matchesSearch = c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = sessionTypeFilter === "All" || c.sessionType === sessionTypeFilter;
    return matchesSearch && matchesType;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'email') {
      comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
    } else if (sortBy === 'date') {
      comparison = a.rawDate.getTime() - b.rawDate.getTime();
    }
    return sortDirection === 'desc' ? comparison * -1 : comparison;
  });

  const TabButton: React.FC<{ tab: 'upcoming' | 'previous', label: string }> = ({ tab, label }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          isActive 
            ? 'bg-(--title) text-(--text1) shadow-md' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        {label}
      </button>
    );
  };
  
  const handleSortChange = (key: SortKey, direction: SortDirection) => {
    setSortBy(key);
    setSortDirection(direction);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex-1 border border-(--outline) h-full bg-(--bg) p-4 rounded-2xl shadow-md">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-extrabold text-(--text-muted)">Consultations</h2>
          <div className="flex space-x-2 p-2 bg-(--bg-dark) rounded-full">
            <TabButton tab="upcoming" label="Upcoming Consultations" />
            <TabButton tab="previous" label="Previous Consultations" />
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow"
            />
            <AiOutlineSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(prev => !prev)}
              className={`p-2.5 bg-gray-100 border border-gray-300 rounded-lg transition-colors flex items-center ${isFilterOpen ? 'bg-gray-200 ring-2 ring-blue-500' : 'hover:bg-gray-200'}`}
              title="Filter options"
            >
              <AiOutlineFilter size={20} className="text-gray-600" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="p-3 font-bold text-xs text-gray-700 uppercase border-b">Sort By</div>
                <button
                  onClick={() => handleSortChange('date', sortBy === 'date' && sortDirection === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="flex items-center"><AiOutlineCalendar className="mr-2" /> Date</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {sortBy === 'date' ? (sortDirection === 'desc' ? 'Newest ⬇️' : 'Oldest ⬆️') : 'Sort'}
                  </span>
                </button>
                <button
                  onClick={() => handleSortChange('email', sortBy === 'email' && sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="flex items-center"><AiOutlineSortAscending className="mr-2" /> Email</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {sortBy === 'email' ? (sortDirection === 'asc' ? 'A-Z' : 'Z-A') : 'Sort'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">loading consultations...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 text-sm">
                    no {activeTab} consultations found.
                  </td>
                </tr>
              ) : (
                sortedData.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{consultation.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold uppercase ${getBadgeClasses(consultation.sessionType)}`}>
                        {consultation.sessionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consultation.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consultation.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsultationsTable;