'use client';

import React, { useState } from 'react';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineSortAscending, AiOutlineCalendar } from 'react-icons/ai';

interface Consultation {
  id: number;
  email: string;
  sessionType: 'Counseling' | 'Routine Interview' | 'Follow-up';
  time: string;
  date: string;
}

// Define Sorting Types
type SortKey = 'date' | 'email';
type SortDirection = 'asc' | 'desc'; // Ascending (A-Z, Oldest) or Descending (Z-A, Newest)

// Mock Data for Upcoming Consultations
const mockUpcomingData: Consultation[] = [
  { id: 1, email: 'johndelacruz@umak.edu.ph', sessionType: 'Counseling', time: '11:30 AM', date: '08/16/2025' },
  { id: 2, email: 'isabella.cruz@umak.edu.ph', sessionType: 'Routine Interview', time: '4:30 PM', date: '08/18/2025' },
  { id: 3, email: 'ramon.villanueva@umak.edu.ph', sessionType: 'Routine Interview', time: '7:30 AM', date: '08/21/2025' },
  { id: 4, email: 'clarisse.delarosa@umak.edu.ph', sessionType: 'Counseling', time: '3:00 PM', date: '08/24/2025' },
  { id: 5, email: 'miguel.santos@umak.edu.ph', sessionType: 'Counseling', time: '1:00 PM', date: '08/25/2025' },
  { id: 6, email: 'jasmine.mercado@umak.edu.ph', sessionType: 'Counseling', time: '11:30 AM', date: '08/28/2025' },
];

// Mock Data for Previous Consultations
const mockPreviousData: Consultation[] = [
    { id: 7, email: 'maria.lopez@umak.edu.ph', sessionType: 'Follow-up', time: '10:00 AM', date: '08/15/2025' },
    { id: 8, email: 'carl.garcia@umak.edu.ph', sessionType: 'Counseling', time: '2:00 PM', date: '08/14/2025' },
    { id: 9, email: 'ana.rivera@umak.edu.ph', sessionType: 'Routine Interview', time: '9:00 AM', date: '08/12/2025' },
];

// Map Session Types to Tailwind Badge Colors
const getBadgeClasses = (type: Consultation['sessionType']) => {
  switch (type) {
    case 'Counseling':
      return 'bg-teal-400 text-teal-900'; // Similar to bright cyan/teal in the image
    case 'Routine Interview':
      return 'bg-indigo-600 text-indigo-100'; // Similar to deep purple in the image
    case 'Follow-up':
      return 'bg-gray-400 text-gray-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

/**
 * A self-contained component for displaying upcoming and previous consultations in a table.
 */
const ConsultationsTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // State for sorting preference (Restored)
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const displayData = activeTab === 'upcoming' ? mockUpcomingData : mockPreviousData;
  let filteredData = displayData.filter(c => 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.sessionType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Sorting Logic (Applied in memory, Restored) ---
  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'email') {
      const emailA = a.email.toLowerCase();
      const emailB = b.email.toLowerCase();
      if (emailA > emailB) comparison = 1;
      else if (emailA < emailB) comparison = -1;
    } else if (sortBy === 'date') {
      // NOTE: For simplicity, converting MM/DD/YYYY to Date object for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA > dateB) comparison = 1;
      else if (dateA < dateB) comparison = -1;
    }

    // Apply direction (descending reverses the comparison result)
    return sortDirection === 'desc' ? comparison * -1 : comparison;
  });
  // --- End Sorting Logic ---

  const TabButton: React.FC<{ tab: 'upcoming' | 'previous', label: string }> = ({ tab, label }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          isActive 
            ? 'bg-[var(--title)] text-[var(--text1)] shadow-md' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        {label}
      </button>
    );
  };
  
  // Handle Filter Change (Restored)
  const handleSortChange = (key: SortKey, direction: SortDirection) => {
      setSortBy(key);
      setSortDirection(direction);
      setIsFilterOpen(false); // Close dropdown after selection
  };

  const getSortIcon = (key: SortKey) => {
      if (sortBy !== key) return null;
      return sortDirection === 'asc' ? ' (A-Z)' : ' (Z-A)';
  }


  return (
    <div className="flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-4 rounded-2xl shadow-md">
      
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        
        {/* Title and Tabs */}
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-extrabold text-[var(--text-muted)]">Consultations</h2>
          <div className="flex space-x-2 p-2 bg-[var(--bg-dark)] rounded-full">
            <TabButton tab="upcoming" label="Upcoming Consultations" />
            <TabButton tab="previous" label="Previous Consultations" />
          </div>
        </div>
        
        {/* Search and Filter (Restored Filter Dropdown UI) */}
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
          
          {/* Filter Dropdown Container */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(prev => !prev)}
              className={`p-2.5 bg-gray-100 border border-gray-300 rounded-lg transition-colors flex items-center ${isFilterOpen ? 'bg-gray-200 ring-2 ring-blue-500' : 'hover:bg-gray-200'}`}
              title="Filter options"
            >
              <AiOutlineFilter size={20} className="text-gray-600" />
            </button>
            
            {/* Dropdown Content */}
            {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                    <div className="p-3 font-bold text-xs text-gray-700 uppercase border-b">Sort By</div>
                    
                    {/* Sort by Date Button */}
                    <button
                        // Toggles direction (Newest/Oldest) on the date column
                        onClick={() => handleSortChange('date', sortBy === 'date' && sortDirection === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <span className="flex items-center"><AiOutlineCalendar className="mr-2" /> Date</span>
                        <span className="text-xs font-semibold text-blue-600">
                            {sortBy === 'date' ? (sortDirection === 'desc' ? 'Newest ⬇️' : 'Oldest ⬆️') : 'Sort'}
                        </span>
                    </button>

                    {/* Sort by Email Button */}
                    <button
                        // Toggles direction (A-Z/Z-A) on the email column
                        onClick={() => handleSortChange('email', sortBy === 'email' && sortDirection === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <span className="flex items-center"><AiOutlineSortAscending className="mr-2" /> Email</span>
                        <span className="text-xs font-semibold text-blue-600">
                             {sortBy === 'email' ? getSortIcon('email') : 'Sort'}
                        </span>
                    </button>
                    
                    <div className="p-3 font-bold text-xs text-gray-700 uppercase border-t mt-1">
                        Current Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} ({sortDirection === 'desc' ? 'Desc' : 'Asc'})
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Session Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 text-sm">
                        No {activeTab} consultations found.
                    </td>
                </tr>
            ) : (
                sortedData.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                        {/* Email */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{consultation.email}</td>
                        
                        {/* Session Type Badge */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span 
                                className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold uppercase ${getBadgeClasses(consultation.sessionType)}`}
                            >
                                {consultation.sessionType}
                            </span>
                        </td>
                        
                        {/* Time */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consultation.time}</td>
                        
                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consultation.date}</td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultationsTable;
