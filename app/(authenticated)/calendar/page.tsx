'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { AiOutlineClose } from 'react-icons/ai'; 

// --- Persistent Layout Components ---
import Sidebar from "@/components/Sidebar"; 
import Header from "@/components/Header";   

// --- Calendar/Agenda Components and Types ---
// NOTE: These files must exist at the referenced paths for the page to compile.
import CalendarComponent from '@/components/calendar/CalendarComponent'; // Calendar View
import AgendaComponent from '@/components/calendar/AgendaComponent'; // Agenda Sidebar
import AgendaModal from '@/components/calendar/AgendaModal'; // Agenda Form Modal
import AgendaDetailsModal from '@/components/calendar/AgendaDetailsModal'; // View/Edit/Delete
import DayAgendasModal from '@/components/calendar/DayAgendasModal'; // Full Day View
import { AgendaData, AgendaForm } from '@/components/types/agenda.types'; // Shared Types
import Link from 'next/link';


// --- Main Client Component: Calendar Page Layout ---
const CalendarClient = () => {
  const pathname = usePathname();

  // --- Agenda State Management (Core of the application) ---
  const [agendas, setAgendas] = useState<AgendaData[]>([
    // Mock data for initial calendar state
    { id: 1, title: "Counseling Session", date: "2025-10-30", type: "Counseling", startTime: "09:00", endTime: "10:00" },
    { id: 2, title: "Faculty Meeting", date: "2025-10-30", type: "Meeting", startTime: "14:00", endTime: "15:30" },
    { id: 3, title: "Job Interview", date: "2025-10-31", type: "Routine Interview", startTime: "10:00", endTime: "11:00" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaData | null>(null);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaData | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string>("");
  
  // Day Agenda Modal States
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<string>("");
  const [selectedDayAgendas, setSelectedDayAgendas] = useState<AgendaData[]>([]);


  // --- Layout Handlers ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);
  
  // Closes mobile menu instantly after a link is clicked
  const handleLinkClick = useCallback((tabName: string) => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);


  // --- Agenda Logic Handlers ---

  const handleSaveAgenda = (formData: AgendaForm) => {
    if (editingAgenda) {
      // Update existing agenda
      setAgendas(prev => prev.map(a => 
        a.id === editingAgenda.id 
          ? { ...formData, id: editingAgenda.id } 
          : a
      ));
      setEditingAgenda(null);
    } else {
      // Create new agenda
      const newAgenda: AgendaData = { ...formData, id: Date.now() };
      setAgendas(prev => [...prev, newAgenda]);
    }
    setPrefilledDate("");
  };
  
  const handleDeleteAgenda = (id: number) => {
    setAgendas(prev => prev.filter(a => a.id !== id));
  };
  
  const handleEditAgenda = (agenda: AgendaData) => {
    setEditingAgenda(agenda);
    setIsModalOpen(true);
    setSelectedAgenda(null); // Close details modal
  };

  const handleDateClick = (date: string) => {
    setPrefilledDate(date);
    setIsModalOpen(true);
  };
  
  const handleCreateAgenda = () => {
    setEditingAgenda(null);
    setPrefilledDate("");
    setIsModalOpen(true);
  };

  const handleCreateAgendaFromDay = () => {
    // PrefilledDate is already set by handleDayClick
    setIsModalOpen(true);
    setIsDayModalOpen(false);
  };

  const handleDayClick = (date: string, dayAgendas: AgendaData[]) => {
    setSelectedDayDate(date);
    setSelectedDayAgendas(dayAgendas);
    setIsDayModalOpen(true);
  };

  // --- Modal Data Memo ---
  const initialModalData = useMemo(() => {
    if (editingAgenda) {
      return {
        title: editingAgenda.title,
        date: editingAgenda.date,
        type: editingAgenda.type,
        startTime: editingAgenda.startTime,
        endTime: editingAgenda.endTime,
      };
    }
    if (prefilledDate) {
      return {
        title: "",
        date: prefilledDate,
        type: "Counseling",
        startTime: "09:00",
        endTime: "10:00",
      };
    }
    return undefined;
  }, [editingAgenda, prefilledDate]);


  return (
    <>
      {/* Main Content Area: Renders the Calendar/Agenda components directly */}
      <div className="mb-4">
        <div className="flex flex-row space-x-1">
          <Link href="/dashboard" className="font-extrabold text-[var(--text-muted)] hover:text-[var(--title)] transition-colors">
            Dashboard
          </Link>
          <a className="font-regular text-[var(--text-muted)] ">
            / Calendar
          </a>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--title)] hidden sm:block">
            Scheduling Management
          </h1>
        </div>
      </div>

      {/* Grid Layout: Calendar (2 cols) + Agenda (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left Side: Calendar (2/3 width) */}
        <div className="lg:col-span-2">
          <CalendarComponent
            agendas={agendas}
            onDateClick={handleDateClick}
            onAgendaClick={setSelectedAgenda}
            onCreateAgenda={handleCreateAgenda}
            onDayClick={handleDayClick} 
          />
        </div>
        {/* Right Side: Agenda List (1/3 width) */}
        <div className="lg:col-span-1">
          <AgendaComponent
            agendas={agendas}
            onAgendaClick={setSelectedAgenda}
            onCreateAgenda={handleCreateAgenda}
          />
        </div>
        {/* space for bottom */}
        <div className='h-10'></div>
      </div>

      


      {/* --- MODAL LAYERS (Always rendered outside the main flow) --- */}

      {/* Agenda Create/Edit Modal */}
      <AgendaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAgenda(null);
          setPrefilledDate("");
        }}
        onSave={handleSaveAgenda}
        title={editingAgenda ? "Edit Agenda" : "New Agenda"}
        submitText={editingAgenda ? "Update Agenda" : "Create Agenda"}
        initialData={initialModalData}
      />

      {/* Agenda Details Modal (View/Edit/Delete trigger) */}
      <AgendaDetailsModal
        agenda={selectedAgenda}
        onClose={() => setSelectedAgenda(null)}
        onEdit={handleEditAgenda}
        onDelete={handleDeleteAgenda}
      />
      
      {/* Day Agendas Modal (Click on a full day in the calendar) */}
      <DayAgendasModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        date={selectedDayDate}
        agendas={selectedDayAgendas}
        onAgendaClick={setSelectedAgenda}
        onCreateAgenda={handleCreateAgendaFromDay}
      />

    </>
  );
};

export default CalendarClient;
