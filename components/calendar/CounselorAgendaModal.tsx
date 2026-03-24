'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { X, ChevronUp, Search } from 'lucide-react';
import { LuLoaderCircle, LuUser, LuCalendar, LuClock, LuCheck, LuChevronDown } from 'react-icons/lu';
import { IoIosWarning } from "react-icons/io";
import { Student } from '@/lib/api/appointments/students';

interface CounselorAgendaForm {
  date: string;
  type: 'counseling' | 'routine_interview';
  startTime: string;
  endTime: string;
  studentId: string;
  urgency: 'urgent' | 'regular';
}

interface CounselorAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CounselorAgendaForm) => void;
  initialData?: CounselorAgendaForm | null;
  students: Student[];
  title?: string;
  submitText?: string;
  bookedSlots?: string[]; 
}

const START_TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00",
];

const formatDisplayTime = (time24: string): string => {
  const [hour, minute] = time24.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const addOneHour = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number);
  return `${String(hour + 1).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const addWorkingDays = (startDate: Date, daysToAdd: number): Date => {
  const result = new Date(startDate);
  let count = 0;
  while (count < daysToAdd) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) count++;
  }
  return result;
};

export default function CounselorAgendaModal({
  isOpen, onClose, onSave, initialData = null, students, title = "Schedule Consultation", submitText = "Send Request", bookedSlots = [],
}: CounselorAgendaModalProps) {
  const [formData, setFormData] = useState<CounselorAgendaForm>({
    date: "", type: "counseling", startTime: "08:00", endTime: "09:00", studentId: "", urgency: "regular",
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const studentRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // Logic for react-datepicker
  const minDate = useMemo(() => {
    const today = new Date();
    const daysToAdd = formData.urgency === 'urgent' ? 3 : 5;
    return addWorkingDays(today, daysToAdd);
  }, [formData.urgency]);

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...initialData, urgency: initialData.urgency || 'regular' } : {
        date: "", type: "counseling", startTime: "08:00", endTime: "09:00", studentId: "", urgency: "regular",
      });
      setValidationError(null);
      setIsSubmitting(false);
      setSearchQuery("");
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (studentRef.current && !studentRef.current.contains(target) && 
          timeRef.current && !timeRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleValidationAndSave = async () => {
    if (!formData.studentId || !formData.date || !formData.startTime) {
      setValidationError("Please select a student, date, and time.");
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setValidationError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    (s?.email?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-datepicker-container .react-datepicker-wrapper { width: 100%; }
        .heron-calendar-popup {
          font-family: inherit !important;
          border-radius: 1rem !important;
          border: 1px solid var(--border) !important;
          background-color: var(--card) !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
          color: var(--foreground) !important;
        }
        .react-datepicker__header {
          background-color: var(--card-dark) !important;
          border-bottom: 1px solid var(--border) !important;
          border-radius: 1rem 1rem 0 0 !important;
        }
        .react-datepicker__current-month, .react-datepicker__day-name {
          color: var(--title) !important;
          font-weight: 800 !important;
          text-transform: uppercase;
        }
        .react-datepicker__day--selected {
          background-color: var(--button) !important;
          color: var(--button-text) !important;
          border-radius: 0.5rem !important;
        }
        .react-datepicker__day--disabled {
          color: var(--foreground-muted) !important;
          opacity: 0.2 !important;
        }
      `}} />

      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />
      
      <div
        className="relative w-full max-w-md md:max-w-lg bg-[var(--card)] rounded-2xl shadow-lg p-6 md:p-8 max-h-[98vh] overflow-y-auto no-scrollbar animate-in zoom-in duration-200 border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--title)]">{title}</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-1 transition-colors rounded-full">
            <X size={20} />
          </button>
        </div>

        {validationError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r-xl flex items-center gap-3">
            <IoIosWarning className="text-red-500 text-lg shrink-0" />
            <p className="text-xs text-red-600 font-medium">{validationError}</p>
          </div>
        )}

        <div className="space-y-4 md:space-y-5">
          {/* Urgency Level */}
          <div>
            <label className="block text-[var(--foreground)] mb-2 font-bold text-sm md:text-base">Urgency Level</label>
            <div className="flex gap-4">
              {['regular', 'urgent'].map((lvl) => (
                <label key={lvl} className={`flex-1 relative border-2 rounded-xl p-3 cursor-pointer transition-all ${formData.urgency === lvl ? 'border-[var(--button)] bg-[var(--card-dark)]' : 'border-[var(--line)] hover:border-[var(--button)]'}`}>
                  <input type="radio" name="urgency" value={lvl} checked={formData.urgency === lvl} onChange={() => setFormData(p => ({ ...p, urgency: lvl as any, date: '' }))} className="hidden" disabled={isSubmitting} />
                  <div className="flex flex-col">
                    <span className={`font-bold text-xs md:text-sm ${formData.urgency === lvl ? 'text-[var(--button)]' : 'text-[var(--foreground)]'}`}>
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)} Request
                    </span>
                    <span className="text-[10px] text-[var(--foreground-muted)] mt-1">
                      Book {lvl === 'urgent' ? '3' : '5'} working days in advance
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Student Dropdown */}
          <div className="relative" ref={studentRef}>
            <label className="block text-[var(--foreground)] mb-1 font-bold text-sm md:text-base">Select Student *</label>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'student' ? null : 'student')}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-[var(--card-dark)] border border-[var(--border)] transition-all"
            >
              <div className="flex items-center gap-3">
                <LuUser className="text-[var(--foreground-muted)]" size={16} />
                <span className={`text-xs md:text-sm font-bold ${formData.studentId ? "text-[var(--title)]" : "text-[var(--foreground-muted)] opacity-60"}`}>
                  {students.find(s => s.student_id === formData.studentId)?.email || "-- Choose a student --"}
                </span>
              </div>
              <LuChevronDown size={16} className={`text-[var(--foreground-muted)] transition-transform ${openDropdown === 'student' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'student' && (
              <div className="absolute top-full mt-1 w-full bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-2 border-b border-[var(--border)]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" size={14} />
                    <input
                      type="text"
                      placeholder="Search email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[var(--card-dark)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none text-[var(--foreground)]"
                    />
                  </div>
                </div>
                <div className="max-h-32 overflow-y-auto no-scrollbar">
                  {filteredStudents.map((s) => (
                    <button key={s.student_id} type="button" onClick={() => { setFormData(p => ({ ...p, studentId: s.student_id })); setOpenDropdown(null); }}
                      className="flex items-center justify-between w-full px-5 py-2.5 text-left text-xs md:text-sm font-bold hover:bg-[var(--card-dark)] border-b last:border-none border-[var(--border)] transition-colors">
                      <span className={formData.studentId === s.student_id ? "text-[var(--button)]" : "text-[var(--foreground-muted)]"}>{s.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-[var(--foreground)] mb-1 font-bold text-sm md:text-base">Session Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['counseling', 'routine_interview'].map((t) => (
                <button key={t} type="button" onClick={() => setFormData(p => ({ ...p, type: t as any }))}
                  className={`py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${formData.type === t ? "bg-[var(--button)] text-white shadow-md" : "bg-[var(--card-dark)] text-[var(--foreground-muted)] border border-[var(--border)]"}`}>
                  {t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker Section */}
          <div>
            <label className="block text-[var(--foreground)] mb-1 font-bold text-sm md:text-base">Date</label>
            <div className="relative custom-datepicker-container">
              <LuCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] z-10 pointer-events-none" size={16} />
              <DatePicker
                selected={formData.date ? new Date(formData.date) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    const offset = date.getTimezoneOffset();
                    const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
                    setFormData(p => ({ ...p, date: adjusted.toISOString().split('T')[0] }));
                  }
                }}
                filterDate={isWeekday}
                minDate={minDate}
                placeholderText="Select a weekday"
                dateFormat="MMMM d, yyyy"
                disabled={isSubmitting}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--card-dark)] text-xs md:text-sm text-[var(--foreground)] focus:ring-2 focus:ring-[var(--button)] outline-none relative z-0"
                calendarClassName="heron-calendar-popup"
              />
            </div>
            <p className="text-[10px] text-[var(--foreground-muted)] mt-1 font-bold uppercase tracking-wider">
              Earliest: {minDate.toLocaleDateString()} ({formData.urgency === 'urgent' ? '3' : '5'} working days)
            </p>
          </div>

          {/* Time Selection */}
          <div className="flex gap-4">
            <div className="flex-1 relative" ref={timeRef}>
              <label className="block text-[var(--foreground)] mb-1 font-bold text-sm md:text-base">Start Time</label>
              <button type="button" onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}
                className="flex items-center justify-between w-full p-2.5 md:p-3 rounded-xl bg-[var(--card-dark)] border border-[var(--border)] transition-all">
                <div className="flex items-center gap-2">
                  <LuClock className="text-[var(--foreground-muted)]" size={16} />
                  <span className="text-xs md:text-sm font-bold text-[var(--title)]">{formatDisplayTime(formData.startTime)}</span>
                </div>
                <ChevronUp size={16} className={`text-[var(--foreground-muted)] transition-transform ${openDropdown === 'time' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'time' && (
                <div className="absolute bottom-full mb-1 w-full bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <div className="max-h-32 overflow-y-auto no-scrollbar">
                    {START_TIME_SLOTS.map((time) => {
                      const isTaken = bookedSlots.includes(time);
                      return (
                        <button key={time} type="button" disabled={isTaken} onClick={() => { setFormData(p => ({ ...p, startTime: time, endTime: addOneHour(time) })); setOpenDropdown(null); }}
                          className={`flex items-center justify-between w-full px-5 py-2.5 text-left text-xs md:text-sm font-bold border-b last:border-none border-[var(--border)] transition-colors ${isTaken ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--card-dark)]"}`}>
                          <span className={formData.startTime === time ? "text-[var(--button)]" : "text-[var(--foreground-muted)]"}>{formatDisplayTime(time)}</span>
                          {formData.startTime === time && <LuCheck size={14} className="text-[var(--button)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-[var(--foreground)] mb-1 font-bold text-sm md:text-base">End Time</label>
              <div className="flex items-center gap-2 p-2.5 md:p-3 rounded-xl bg-[var(--card-dark)] border border-[var(--border)] opacity-60">
                <LuClock className="text-[var(--foreground-muted)]" size={16} />
                <span className="text-xs md:text-sm font-bold text-[var(--foreground-muted)]">{formatDisplayTime(formData.endTime)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 md:pt-4">
            <button onClick={handleValidationAndSave} disabled={isSubmitting}
              className={`w-full py-3.5 md:py-4 px-12 rounded-full text-sm md:text-md text-[var(--button-text)] font-extrabold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? "bg-[var(--button-dark)] opacity-70 cursor-not-allowed" : "bg-[var(--button)] hover:bg-[var(--button-dark)]"}`}>
              {isSubmitting ? <><LuLoaderCircle className="w-5 h-5 animate-spin" /><span>Sending...</span></> : submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}