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
  const [allAgendas, setAllAgendas] = useState<AgendaData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMap, setStudentMap] = useState<Map<string, Student>>(new Map());
  
  // --- Page State ---
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // --- Modal States ---
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isDayModalOpen, setDayModalOpen] = useState(false);
  
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaData | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);
  const [selectedDayAgendas, setSelectedDayAgendas] = useState<AgendaData[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<string>("");

  // 1. Fetch Students (with pagination and safety checks)
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
          
          console.log(`[StudentMap] Finished building map with ${newMap.size} valid students.`);
          if (badStudentDataCount > 0) {
            console.error(`[StudentMap] Ignored ${badStudentDataCount} students with missing user_id.`);
          }
          console.log('[StudentMap] First 5 keys:', Array.from(newMap.keys()).slice(0, 5));

          setStudentMap(newMap);

        } catch (error) {
          console.error(error);
          toast.error('An error occurred while fetching students.');
        }
      };
      fetchAllStudents();
    }
  }, [session]);

  // 2. Fetch Appointments & Requests (Depends on studentMap)
  const fetchData = async () => {
    // Wait for session AND studentMap to be ready
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

      if (requestsRes.data && requestsRes.data.length > 0) {
        console.log('[fetchData] First request student_id:', requestsRes.data[0].student_id);
      }

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
  }, [session, currentMonth, currentYear, studentMap]);

  // --- Modal Open/Close Handlers ---

  const handleCreateAgenda = () => {
    console.log('[page.tsx] handleCreateAgenda: Opening create modal...');
    setPrefilledDate(null);
    setCreateModalOpen(true);
  };
  
  const handleCreateAgendaForDay = () => {
    console.log('[page.tsx] handleCreateAgendaForDay: Opening create modal...');
    setPrefilledDate(selectedDayDate); // Use the date from the day modal
    setCreateModalOpen(true);
    setDayModalOpen(false); // Close the day modal
  };

  const handleDateClick = (date: string) => {
    console.log('[page.tsx] handleDateClick: Opening create modal with date:', date);
    setPrefilledDate(date);
    setCreateModalOpen(true);
  };

  const handleAgendaClick = (agenda: AgendaData) => {
    console.log('[page.tsx] handleAgendaClick: Opening details modal for:', agenda.id);
    setSelectedAgenda(agenda);
    setDetailsModalOpen(true);
    setDayModalOpen(false); // Close the day modal if it was open
  };
  
  const handleDayClick = (date: string, agendas: AgendaData[]) => {
    console.log(`[page.tsx] handleDayClick: Clicked on date: ${date}, found ${agendas.length} agendas.`);
    if (agendas.length > 0) {
      // If items exist, open the DayAgendasModal
      setSelectedDayDate(date);
      setSelectedDayAgendas(agendas);
      setDayModalOpen(true);
    } else {
      // If day is empty, open the create modal
      handleDateClick(date);
    }
  };

  const closeModal = () => {
    console.log('[page.tsx] closeModal: Closing all modals.');
    setCreateModalOpen(false);
    setDetailsModalOpen(false);
    setDayModalOpen(false);
    
    setSelectedAgenda(null);
    setPrefilledDate(null);
    setSelectedDayAgendas([]);
    setSelectedDayDate("");
  };

  // --- API Action Handlers ---

  const handleSave = async (formData: any) => {
    if (!session?.user?.accessToken) return;

    console.log('[handleSave] Received formData:', formData);
    if (!formData.studentId) {
        console.error('Validation failed: studentId is missing.', formData);
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
    // TODO: Implement cancel logic
    toast.info('Cancel feature not yet implemented.');
  };

  // --- Memoized Props ---

  const studentOptions = useMemo(() => {
    return students.map(s => ({ 
      id: s.student_id, 
      name: s.email  // must use email as 'user_name' is not provided
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

      <AgendaDetailsModal
        agenda={selectedAgenda}
        onClose={closeModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onCancel={handleCancel}
      />
      
      <DayAgendasModal
        isOpen={isDayModalOpen}
        onClose={closeModal}
        date={selectedDayDate}
        agendas={selectedDayAgendas}
        onAgendaClick={handleAgendaClick}
        onCreateAgenda={handleCreateAgendaForDay}
      />
    </div>
  );
}