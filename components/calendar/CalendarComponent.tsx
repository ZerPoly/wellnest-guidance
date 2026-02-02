'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Inbox, Plus } from 'lucide-react';
import { AgendaData, agendaColors } from '../types/agenda.types';
import CustomDropdown from './CustomDropdown';

interface CalendarComponentProps {
  agendas: AgendaData[];
  onDateClick: (date: string) => void;
  onAgendaClick: (agenda: AgendaData) => void;
  onCreateAgenda: () => void;
  onDayClick: (date: string, agendas: AgendaData[]) => void;
  onMonthYearChange?: (month: number, year: number) => void;
  onViewRequests: () => void;
  pendingCount?: number; // Added this prop
}

export default function CalendarComponent({ 
  agendas, 
  onDateClick, 
  onAgendaClick, 
  onCreateAgenda,
  onDayClick,
  onViewRequests,
  onMonthYearChange,
  pendingCount = 0 // Default value
}: CalendarComponentProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
    if (onMonthYearChange) {
      onMonthYearChange(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthOptions = monthNames.map((name, idx) => ({ 
    value: idx, 
    label: name 
  }));
  
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year, label: year.toString() };
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const nextMonth = () => {
    const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedMonth === today.getMonth() &&
      selectedYear === today.getFullYear()
    );
  };

  const getAgendasForDate = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return agendas.filter(a => a.date === dateStr);
  };

  const handleDayClick = (day: number, e: React.MouseEvent) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAgendas = getAgendasForDate(day);
    
    if (dayAgendas.length === 0) {
      onDateClick(dateStr);
    } else {
      onDayClick(dateStr, dayAgendas);
    }
  };

  const days = [];
  
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 border-r border-b border-gray-100 bg-gray-50/30" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayAgendas = getAgendasForDate(day);
    const isCurrentDay = isToday(day);

    const currentDateObj = new Date(selectedYear, selectedMonth, day);
    currentDateObj.setHours(0, 0, 0, 0);

    const minDateCheck = new Date();
    minDateCheck.setHours(0, 0, 0, 0); 
    minDateCheck.setDate(minDateCheck.getDate() + 7);

    const isDateTooSoon = currentDateObj < minDateCheck; 
    const isWeekend = currentDateObj.getDay() === 0 || currentDateObj.getDay() === 6;
    const isSunday = currentDateObj.getDay() === 0; 
    const isDateDisabled = isDateTooSoon || isWeekend;

    let backgroundClasses = 'bg-white';
    if (isCurrentDay) {
      backgroundClasses = 'bg-purple-100'; 
    } else if (isSunday) {
      backgroundClasses = 'bg-red-50';
    } 
    
    if (isDateDisabled && !isCurrentDay) {
      backgroundClasses = isSunday ? 'bg-red-50' : 'bg-gray-50';
    }

    let textClasses = isCurrentDay ? 'text-purple-700' : 'text-gray-700';
    if (isDateDisabled && !isCurrentDay) {
      textClasses = isSunday ? 'text-red-500' : 'text-gray-400';
    }
    
    days.push(
      <div
        key={day}
        className={`h-32 border-r border-b border-gray-200 p-2 transition overflow-hidden ${backgroundClasses} ${
          isDateDisabled 
            ? 'cursor-not-allowed' 
            : 'cursor-pointer hover:bg-purple-50'
        }`}
        onClick={(e) => {
          if (!isDateDisabled) {
            handleDayClick(day, e);
          }
        }}
      >
        <div className={`text-sm font-semibold mb-1 ${textClasses}`}>
          {day}
        </div>
        
        <div className="space-y-1">
          {dayAgendas.slice(0, 2).map((agenda) => {
            const colors = agendaColors[agenda.type] || agendaColors['Meeting'];
            return (
              <div
                key={agenda.id}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onAgendaClick(agenda); 
                }}
                className={`text-xs px-2 py-1 rounded ${colors.bg} ${colors.border} border truncate hover:shadow-sm transition cursor-pointer ${
                  isDateDisabled ? 'opacity-60' : '' 
                }`}
              >
                <div className={`font-medium ${colors.text}`}>
                  {agenda.title}
                </div>
              </div>
            );
          })}
          {dayAgendas.length > 2 && (
            <div className="text-xs text-gray-500 px-2">
              +{dayAgendas.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CustomDropdown
            value={selectedMonth}
            options={monthOptions}
            onChange={setSelectedMonth}
            label="Month"
          />
          <CustomDropdown
            value={selectedYear}
            options={yearOptions}
            onChange={setSelectedYear}
            label="Year"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium text-sm"
          >
            Today
          </button>
          <button
            onClick={previousMonth}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <ChevronRight size={20} />
          </button>

          <button
            onClick={onViewRequests}
            title="View Pending Requests"
            // ADDED 'relative' here
            className="relative p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <Inbox size={20} />
            {/* RED DOT LOGIC ADDED HERE */}
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm pointer-events-none" />
            )}
          </button>

          <button
            onClick={onCreateAgenda}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div 
            key={day} 
            className={`text-center font-bold py-2 text-sm border-r border-b border-gray-200 bg-gray-50 ${day === 'Sun' ? 'text-red-600' : 'text-gray-600'}`}
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}