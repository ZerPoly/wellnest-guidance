// app/(authenticated)/calendar/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// ... (all your component imports)
import CalendarComponent from '@/components/calendar/CalendarComponent';
import AgendaComponent from '@/components/calendar/AgendaComponent';
import CounselorAgendaModal from '@/components/calendar/CounselorAgendaModal';
import AgendaDetailsModal from '@/components/calendar/AgendaDetailsModal'; // Corrected modal
import { AgendaData } from '@/components/types/agenda.types';

// ... (all your API client imports)
import { getCounselorConfirmedAppointments } from '@/lib/api/appointments/counselorAppointments';
import {
  getCounselorAppointmentRequests,
  acceptCounselorAppointmentRequest,
  declineCounselorAppointmentRequest,
  createCounselorAppointmentRequest,
} from '@/lib/api/appointments/counselorRequests';
import { getDepartmentStudents, Student, StudentsListResponse } from '@/lib/api/appointments/students';

// ... (all your mapper imports)
import {
  appointmentToAgenda,
  requestToAgenda,
  counselorAgendaFormToApiPayload,
  getMonthDateRange,
} from '@/lib/utils/appointmentMappers';

export default function CounselorAppointmentsPage() {
  const { data: session } = useSession();
  
  const [allAgendas, setAllAgendas] = useState<AgendaData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMap, setStudentMap] = useState<Map<string, Student>>(new Map());
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaData | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);

  // 1. Fetch Students (with pagination)
  useEffect(() => {
    if (session?.user?.accessToken) {
      const fetchAllStudents = async () => {
        let allStudents: Student[] = [];
        let cursor: string | undefined = undefined;
        let hasMore = true;
        const token = session.user.accessToken;

        try {
          while (hasMore) {
            const res: any = await getDepartmentStudents(token, cursor, 50);
            if (res.success && res.data) {
              const pageData = res.data as StudentsListResponse;
              allStudents = [...allStudents, ...pageData.classifications];
              cursor = pageData.nextCursor || undefined;
              hasMore = pageData.hasMore && !!pageData.nextCursor;
            } else {
              toast.error(res.message || 'Failed to fetch students.');
              hasMore = false;
            }
          }

          setStudents(allStudents);

          const newMap = new Map<string, Student>();
          allStudents.forEach(s => newMap.set(s.user_id, s));
          
          // ⬇️ --- DEBUGGING FOR "UNKNOWN STUDENT" --- ⬇️
          console.log(`[StudentMap] Finished building map with ${newMap.size} students.`);
          // Log the first 5 student keys to check their format
          console.log('[StudentMap] First 5 keys:', Array.from(newMap.keys()).slice(0, 5));
          // ⬆️ --- END DEBUGGING --- ⬆️

          setStudentMap(newMap); // This triggers the second useEffect

        } catch (error) {
          console.error(error);
          toast.error('An error occurred while fetching students.');
        }
      };
      fetchAllStudents();
    }
  }, [session]);

  // 2. Fetch Appointments & Requests
  const fetchData = async () => {
    // This check is CRUCIAL. It prevents running before the map is ready.
    if (!session?.user?.accessToken || studentMap.size === 0) {
      console.log('[fetchData] Skipping, session or studentMap not ready.');
      return;
    }

    console.log('[fetchData] Session and studentMap are ready. Fetching data...');
    setIsLoading(true);
    const { startDate, endDate } = getMonthDateRange(currentYear, currentMonth);
    const token = session.user.accessToken;

    try {
      const [appointmentsRes, requestsRes] = await Promise.all([
        getCounselorConfirmedAppointments(token, startDate, endDate),
        getCounselorAppointmentRequests(token, 'pending'),
      ]);

      // ⬇️ --- DEBUGGING FOR "UNKNOWN STUDENT" --- ⬇️
      if (appointmentsRes.data && appointmentsRes.data.length > 0) {
        console.log('[fetchData] First appointment student_id:', appointmentsRes.data[0].student_id);
      }
      if (requestsRes.data && requestsRes.data.length > 0) {
        console.log('[fetchData] First request student_id:', requestsRes.data[0].student_id);
      }
      // ⬆️ --- END DEBUGGING --- ⬆️

      const confirmed = (appointmentsRes.data || []).map(app => 
        appointmentToAgenda(app, studentMap)
      );
      const pending = (requestsRes.data || []).map(req => 
        requestToAgenda(req, studentMap)
      );

      setAllAgendas([...confirmed, ...pending]);

    } catch (error) {
      toast.error('Failed to fetch schedule.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch data when session, studentMap, or month/year changes
  useEffect(() => {
    fetchData();
  }, [session, currentMonth, currentYear, studentMap]); // studentMap is a dependency

  // ... (Modal open/close handlers: handleCreateAgenda, handleDateClick, handleAgendaClick, etc.)
  const handleCreateAgenda = () => { /* ... */ };
  const handleDateClick = (date: string) => { /* ... */ };
  const handleAgendaClick = (agenda: AgendaData) => {
    setSelectedAgenda(agenda);
    setDetailsModalOpen(true);
  };
  const handleDayClick = (date: string, agendas: AgendaData[]) => { /* ... */ };
  const closeModal = () => {
    setCreateModalOpen(false);
    setDetailsModalOpen(false);
    setSelectedAgenda(null);
    setPrefilledDate(null);
  };

  // --- API Action Handlers ---

  const handleSave = async (formData: any) => {
    // ... (This is your create logic, it should be fine)
  };

  // ⬇️ --- FIX FOR "BUTTONS NOT WORKING" --- ⬇️
  // These functions are passed to the modal
  const handleAccept = async (agenda: AgendaData) => {
    if (!session?.user?.accessToken || !agenda.request_id) return;
    
    const res = await acceptCounselorAppointmentRequest(agenda.request_id.toString(), session.user.accessToken);

    if (res.success && res.data) {
      toast.success('Appointment accepted and confirmed!');
      fetchData(); // Refresh data
      closeModal();
    } else {
      toast.error(`Error: ${res.message}`);
    }
  };

  const handleDecline = async (agenda: AgendaData) => {
    if (!session?.user?.accessToken || !agenda.request_id) return;

    const res = await declineCounselorAppointmentRequest(agenda.request_id.toString(), session.user.accessToken);

    if (res.success && res.data) {
      toast.warning('Appointment request declined.');
      fetchData(); // Refresh data
      closeModal();
    } else {
      toast.error(`Error: ${res.message}`);
    }
  };
  
  const handleCancel = async (agenda: AgendaData) => {
    // TODO: Add your cancel API call here
    toast.info('Cancel feature not yet implemented.');
  };
  // ⬆️ --- END OF FIX --- ⬆️


  // ... (Memoized studentOptions and initialCreateData)
  const studentOptions = useMemo(() => {
    return students.map(s => ({ id: s.user_id, name: s.user_name }));
  }, [students]);

  const initialCreateData = useMemo(() => {
    if (!prefilledDate) {
      return undefined; // This is a valid value for the prop
    }
    
    // This is the CounselorAgendaForm object
    return {
      date: prefilledDate,
      type: 'counseling' as 'counseling' | 'routine_interview',
      startTime: '08:00',
      endTime: '09:00',
      studentId: '',
    };
  }, [prefilledDate]);


  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Schedule</h1>
      
      {/* ... (Your CalendarComponent and AgendaComponent) ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarComponent
            agendas={allAgendas}
            onDateClick={handleDateClick}
            onAgendaClick={handleAgendaClick}
            onCreateAgenda={handleCreateAgenda}
            onDayClick={handleDayClick}
            onMonthYearChange={(month, year) => {
              setCurrentMonth(month);
              setCurrentYear(year);
            }}
          />
        </div>
        <div className="lg:col-span-1">
          <AgendaComponent
            agendas={allAgendas}
            onAgendaClick={handleAgendaClick}
            onCreateAgenda={handleCreateAgenda}
          />
        </div>
      </div>


      {/* --- Modals --- */}
      
      <CounselorAgendaModal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={initialCreateData}
        students={students}
        title="Schedule Consultation"
        submitText="Send Request"
      />

      {/* ⬇️ --- FIX FOR "BUTTONS NOT WORKING" --- ⬇️ */}
      {/* We must pass the handler functions as props */}
      <AgendaDetailsModal
        agenda={selectedAgenda}
        onClose={closeModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onCancel={handleCancel}
      />
      {/* ⬆️ --- END OF FIX --- ⬆️ */}

    </div>
  );
}