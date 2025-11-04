// app/(authenticated)/calendar/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// --- UI Components ---
import CalendarComponent from '@/components/calendar/CalendarComponent';
import AgendaComponent from '@/components/calendar/AgendaComponent';
import CounselorAgendaModal from '@/components/calendar/CounselorAgendaModal';
import AgendaDetailsModal from '@/components/calendar/AgendaDetailsModal';
import DayAgendasModal from '@/components/calendar/DayAgendasModal';
import PendingRequestsModal from '@/components/calendar/PendingRequestsModal'; 
import { AgendaData } from '@/components/types/agenda.types';

// --- API Client ---
import {
  getCounselorConfirmedAppointments,
} from '@/lib/api/appointments/counselorAppointments';
import {
  getCounselorAppointmentRequests,
  acceptCounselorAppointmentRequest,
  declineCounselorAppointmentRequest,
  createCounselorAppointmentRequest,
} from '@/lib/api/appointments/counselorRequests';
import {
  getDepartmentStudents,
  Student,
  StudentsListResponse,
} from '@/lib/api/appointments/students';

// --- Mappers ---
import {
  appointmentToAgenda,
  requestToAgenda,
  counselorAgendaFormToApiPayload,
  getMonthDateRange,
} from '@/lib/utils/appointmentMappers';

export default function CounselorAppointmentsPage() {
  const { data: session } = useSession();
  
  // --- Data State ---
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMap, setStudentMap] = useState<Map<string, Student>>(new Map());
  
  // ⬇️ --- FIX: Split state per developer's request --- ⬇️
  // This list is JUST for the CalendarComponent (grid)
  const [calendarAgendas, setCalendarAgendas] = useState<AgendaData[]>([]);
  // This list is for the AgendaComponent (list)
  const [listAgendas, setListAgendas] = useState<AgendaData[]>([]);
  
  // --- Page State ---
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // --- Modal States ---
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isDayModalOpen, setDayModalOpen] = useState(false);
  const [isRequestsModalOpen, setRequestsModalOpen] = useState(false);
  
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaData | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);
  const [selectedDayAgendas, setSelectedDayAgendas] = useState<AgendaData[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<string>("");

  // 1. Fetch Students
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
          let badStudentDataCount = 0;
          allStudents.forEach(s => {
            if (s && s.student_id) {
              newMap.set(s.student_id, s); 
            } else {
              console.warn('[StudentMap] Ignoring bad student data:', s);
              badStudentDataCount++;
            }
          });
          
          if (badStudentDataCount > 0) {
            console.error(`[StudentMap] Ignored ${badStudentDataCount} students with missing user_id.`);
          }
          setStudentMap(newMap);

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
    if (!session?.user?.accessToken || studentMap.size === 0) {
      return;
    }

    setIsLoading(true);
    const { startDate, endDate } = getMonthDateRange(currentYear, currentMonth);
    const token = session.user.accessToken;

    try {
      // --- ⬇️ FIX: Using the student-side logic ⬇️ ---
      const [
        appointmentsRes, 
        requestsRes
      ] = await Promise.all([
        getCounselorConfirmedAppointments(token, startDate, endDate), // 1. Gets "Confirmed"
        getCounselorAppointmentRequests(token),                      // 2. Gets ALL requests
      ]);
      // --- ⬆️ END OF FIX ⬆️ ---

      const confirmedAgendas: AgendaData[] = [];
      const pendingAgendas: AgendaData[] = [];
      const declinedAgendas: AgendaData[] = [];

      // 1. Process "Accepted" (Confirmed) appointments
      if (appointmentsRes.success && appointmentsRes.data) {
        appointmentsRes.data.forEach(app => {
          confirmedAgendas.push(appointmentToAgenda(app, studentMap));
        });
      }

      // 2. Process all "Requests"
      if (requestsRes.success && requestsRes.data) {
        requestsRes.data.forEach(req => {
          if (req.status === 'pending') {
            pendingAgendas.push(requestToAgenda(req, studentMap));
          } else if (req.status === 'declined') {
            declinedAgendas.push(requestToAgenda(req, studentMap));
          }
          // "both_confirmed" requests are ignored, solving the duplicate bug
        });
      }

      // De-duplicate just in case
      const confirmedMap = new Map<string | number, AgendaData>();
      confirmedAgendas.forEach(agenda => confirmedMap.set(agenda.id, agenda));
      const uniqueConfirmed = Array.from(confirmedMap.values());

      const pendingMap = new Map<string | number, AgendaData>();
      pendingAgendas.forEach(agenda => pendingMap.set(agenda.id, agenda));
      const uniquePending = Array.from(pendingMap.values());
      
      const declinedMap = new Map<string | number, AgendaData>();
      declinedAgendas.forEach(agenda => declinedMap.set(agenda.id, agenda));
      const uniqueDeclined = Array.from(declinedMap.values());

      // Set the state for the two components
      // The Calendar ONLY gets confirmed appointments
      setCalendarAgendas(uniqueConfirmed);
      
      // The Agenda List gets EVERYTHING
      setListAgendas([...uniqueConfirmed, ...uniquePending, ...uniqueDeclined]);

    } catch (error: any) { 
      toast.error('Failed to fetch schedule.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch data when session, studentMap, or month/year changes
  useEffect(() => {
    fetchData();
  }, [session, currentMonth, currentYear, studentMap]);

  // --- Modal Open/Close Handlers ---
  const handleCreateAgenda = () => {
    setPrefilledDate(null);
    setCreateModalOpen(true);
  };
  
  const handleCreateAgendaForDay = () => {
    setPrefilledDate(selectedDayDate);
    setCreateModalOpen(true);
    setDayModalOpen(false);
  };

  const handleDateClick = (date: string) => {
    setPrefilledDate(date);
    setCreateModalOpen(true);
  };

  const handleAgendaClick = (agenda: AgendaData) => {
    setSelectedAgenda(agenda);
    setDetailsModalOpen(true);
    setDayModalOpen(false); 
    setRequestsModalOpen(false);
  };
  
  const handleDayClick = (date: string, agendas: AgendaData[]) => {
    if (agendas.length > 0) {
      setSelectedDayDate(date);
      setSelectedDayAgendas(agendas);
      setDayModalOpen(true);
    } else {
      handleDateClick(date);
    }
  };

  const handleViewRequests = () => {
    console.log('[page.tsx] handleViewRequests: Opening requests modal...');
    setRequestsModalOpen(true);
  };

  const closeModal = () => {
    setCreateModalOpen(false);
    setDetailsModalOpen(false);
    setDayModalOpen(false);
    setRequestsModalOpen(false);
    
    setSelectedAgenda(null);
    setPrefilledDate(null);
    setSelectedDayAgendas([]);
    setSelectedDayDate("");
  };

  // --- API Action Handlers ---
  const handleSave = async (formData: any) => {
    if (!session?.user?.accessToken) return;
    if (!formData.studentId) {
        toast.error('Validation Failed: Please select a student.');
        return;
    }
    const payload = counselorAgendaFormToApiPayload(formData);
    const toastId = toast.loading('Sending request...');
    const res = await createCounselorAppointmentRequest(payload, session.user.accessToken);
    if (res.success && res.data) {
      toast.success('Appointment request sent!', { id: toastId });
      fetchData(); // Refresh data
      closeModal();
    } else {
      toast.error(`Error: ${res.message}`, { id: toastId });
    }
  };

  const handleAccept = async (agenda: AgendaData) => {
    if (!session?.user?.accessToken || !agenda.request_id) return;
    const res = await acceptCounselorAppointmentRequest(agenda.request_id.toString(), session.user.accessToken);
    if (res.success && res.data) {
      toast.success('Appointment accepted and confirmed!');
      fetchData(); // Refresh data
      closeModal();
    } else {
      toast.error(`Error accepting: ${res.message}`);
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
      toast.error(`Error declining: ${res.message}`);
    }
  };
  
  const handleCancel = async (agenda: AgendaData) => {
    toast.info('Cancel feature not yet implemented.');
  };

  // --- Memoized Props ---
  const studentOptions = useMemo(() => {
    return students.map(s => ({ 
      id: s.student_id, 
      name: s.email
    }));
  }, [students]);

  const initialCreateData = useMemo(() => {
    if (!prefilledDate) {
      return undefined;
    }
    return {
      date: prefilledDate,
      type: 'counseling' as 'counseling' | 'routine_interview',
      startTime: '08:00',
      endTime: '09:00',
      studentId: '',
    };
  }, [prefilledDate]);

  // --- Render ---
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Schedule</h1>
      
      {isLoading && <p>Loading schedule...</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* ⬇️ FIX: Pass the correct state ⬇️ */}
          <CalendarComponent
            agendas={calendarAgendas}
            onDateClick={handleDateClick}
            onAgendaClick={handleAgendaClick}
            onCreateAgenda={handleCreateAgenda}
            onDayClick={handleDayClick}
            onMonthYearChange={(month, year) => {
              setCurrentMonth(month);
              setCurrentYear(year);
            }}
            onViewRequests={handleViewRequests}
          />
        </div>
        
        <div className="lg:col-span-1">
          {/* ⬇️ FIX: Pass the correct state ⬇️ */}
          <AgendaComponent
            agendas={listAgendas}
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

      <AgendaDetailsModal
        agenda={selectedAgenda}
        onClose={closeModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
        // onCancel is correctly removed
      />
      
      <DayAgendasModal
        isOpen={isDayModalOpen}
        onClose={closeModal}
        date={selectedDayDate}
        agendas={selectedDayAgendas}
        onAgendaClick={handleAgendaClick}
        onCreateAgenda={handleCreateAgendaForDay}
      />

      <PendingRequestsModal
        isOpen={isRequestsModalOpen}
        onClose={closeModal}
        agendas={listAgendas} // Pass the full list
        onAgendaClick={handleAgendaClick}
      />

    </div>
  );
}