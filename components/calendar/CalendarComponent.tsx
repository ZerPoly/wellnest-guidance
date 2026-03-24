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
  hasPending?: boolean;
}

export default function CalendarComponent({ 
  agendas, 
  onDateClick, 
  onAgendaClick, 
  onCreateAgenda,
  onDayClick,
  onViewRequests,
  onMonthYearChange,
  hasPending = false 
}: CalendarComponentProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
    if (onMonthYearChange) {
      onMonthYearChange(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, onMonthYearChange]);
  
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

  const handleDayInternalClick = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAgendas = getAgendasForDate(day);
    
    if (dayAgendas.length === 0) {
      onDateClick(dateStr);
    } else {
      onDayClick(dateStr, dayAgendas);
    }
  };

  const days = [];
  
  // Empty filler cells for previous month padding
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 border border-[var(--line)] bg-[var(--background)]" />);
  }

  // Logic for generating the calendar days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayAgendas = getAgendasForDate(day);
    const today = isToday(day);

    const currentDateObj = new Date(selectedYear, selectedMonth, day);
    currentDateObj.setHours(0, 0, 0, 0); 

    const minDateCheck = new Date();
    minDateCheck.setHours(0, 0, 0, 0); 
    minDateCheck.setDate(minDateCheck.getDate() + 7);

    const isDateTooSoon = currentDateObj < minDateCheck; 
    const isWeekend = currentDateObj.getDay() === 0 || currentDateObj.getDay() === 6;
    const isDateDisabled = isDateTooSoon || isWeekend;

    days.push(
      <div
        key={day}
        className={`h-32 border border-[var(--border)] p-2 transition overflow-hidden ${
          today 
            ? 'bg-[var(--today-bg)] border-[var(--button)] ring-1 ring-[var(--button)]' 
            : 'bg-[var(--card)]'
        } ${
          isDateDisabled 
            ? 'bg-[var(--disabled-bg)] opacity-60 text-[var(--foreground-placeholder)] cursor-not-allowed grayscale' 
            : 'cursor-pointer hover:bg-[var(--card-dark)]'
        }`}
        onClick={() => {
          if (!isDateDisabled) {
            handleDayInternalClick(day);
          }
        }}
      >
        <div className={`text-sm font-bold mb-1 ${
          today ? 'text-[var(--button)]' : (isDateDisabled ? 'text-[var(--foreground-placeholder)]' : 'text-[var(--foreground)]')
        }`}>
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
                  isDateDisabled ? 'opacity-40' : '' 
                }`}
              >
                <div className={`font-medium ${colors.text}`}>
                  {agenda.student_name || agenda.title}
                </div>
              </div>
            );
          })}
          {dayAgendas.length > 2 && (
            <div className="text-[10px] text-[var(--foreground-muted)] px-1 font-bold">
              +{dayAgendas.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6">
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
            className="px-4 py-2 bg-[var(--background)] text-[var(--title)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-dark)] transition font-bold text-sm"
          >
            Today
          </button>
          <button
            onClick={previousMonth}
            className="p-2 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-dark)] text-[var(--foreground)] transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-dark)] text-[var(--foreground)] transition"
          >
            <ChevronRight size={20} />
          </button>

          <button 
            onClick={onViewRequests} 
            title="View Pending Requests"
            className="relative p-2 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--card-dark)] transition"
          >
            <Inbox size={20} />
            {hasPending && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--card)] animate-pulse shadow-sm" />
            )}
          </button>

          <button
            onClick={onCreateAgenda}
            className="p-2 bg-[var(--button)] text-[var(--button-text)] rounded-lg hover:bg-[var(--button-dark)] transition shadow-sm active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 border-t border-l border-[var(--border)]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div 
            key={day} 
            className="text-center font-bold text-[var(--foreground-muted)] py-2 text-sm border-r border-b border-[var(--border)] bg-[var(--background)]"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}