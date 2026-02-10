'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from "next/link";

// ui components
import CalendarComponent from '@/components/calendar/CalendarComponent';
import AgendaComponent from '@/components/calendar/AgendaComponent';
import CounselorAgendaModal from '@/components/calendar/CounselorAgendaModal';
import AgendaDetailsModal from '@/components/calendar/AgendaDetailsModal';
import DayAgendasModal from '@/components/calendar/DayAgendasModal';
import PendingRequestsModal from '@/components/calendar/PendingRequestsModal'; 
import { AgendaData } from '@/components/types/agenda.types';

// api client
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

// mappers
import {
  appointmentToAgenda,
  requestToAgenda,
  counselorAgendaFormToApiPayload,
  getMonthDateRange,
} from '@/lib/utils/appointmentMappers';

const CalendarClient = () => {
  const { data: session } = useSession();
  
  // data state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMap, setStudentMap] = useState<Map<string, Student>>(new Map());
  const [calendarAgendas, setCalendarAgendas] = useState<AgendaData[]>([]);
  const [listAgendas, setListAgendas] = useState<AgendaData[]>([]);
  
  // page state
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // modal states
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isDayModalOpen, setDayModalOpen] = useState(false);
  const [isRequestsModalOpen, setRequestsModalOpen] = useState(false);
  
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaData | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);
  const [selectedDayAgendas, setSelectedDayAgendas] = useState<AgendaData[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<string>("");

  // check if there are any pending requests for the red dot indicator
  const hasPending = useMemo(() => {
    return listAgendas.some(agenda => agenda.status === 'pending');
  }, [listAgendas]);

  // fetch students
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
              toast.error(res.message || 'failed to fetch students.');
              hasMore = false;
            }
          }
          setStudents(allStudents);

          const newMap = new Map<string, Student>();
          allStudents.forEach(s => {
            if (s && s.student_id) {
              newMap.set(s.student_id, s); 
            }
          });
          setStudentMap(newMap);
        } catch (error) {
          toast.error('an error occurred while fetching students.');
        }
      };
      fetchAllStudents();
    }
  }, [session]);

  // fetch appointments and requests
  const fetchData = async () => {
    if (!session?.user?.accessToken || studentMap.size === 0) return;

    setIsLoading(true);
    const { startDate, endDate } = getMonthDateRange(currentYear, currentMonth);
    const token = session.user.accessToken;

    try {
      const [appointmentsRes, requestsRes] = await Promise.all([
        getCounselorConfirmedAppointments(token, startDate, endDate),
        getCounselorAppointmentRequests(token),
      ]);

      const confirmedAgendas: AgendaData[] = [];
      const pendingAgendas: AgendaData[] = [];
      const declinedAgendas: AgendaData[] = [];

      if (appointmentsRes.success && appointmentsRes.data) {
        appointmentsRes.data.forEach(app => {
          confirmedAgendas.push(appointmentToAgenda(app, studentMap));
        });
      }

      if (requestsRes.success && requestsRes.data) {
        requestsRes.data.forEach(req => {
          if (req.status === 'pending') {
            pendingAgendas.push(requestToAgenda(req, studentMap));
          } else if (req.status === 'declined') {
            declinedAgendas.push(requestToAgenda(req, studentMap));
          }
        });
      }

      setCalendarAgendas(confirmedAgendas);
      setListAgendas([...confirmedAgendas, ...pendingAgendas, ...declinedAgendas]);
    } catch (error) { 
      toast.error('failed to fetch schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session, currentMonth, currentYear, studentMap]);

  // modal handlers
  const handleCreateAgenda = () => {
    setPrefilledDate(null);
    setCreateModalOpen(true);
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

  const closeModal = () => {
    setCreateModalOpen(false);
    setDetailsModalOpen(false);
    setDayModalOpen(false);
    setRequestsModalOpen(false);
    setSelectedAgenda(null);
    setPrefilledDate(null);
  };

  const handleSave = async (formData: any) => {
    if (!session?.user?.accessToken) return;
    const payload = counselorAgendaFormToApiPayload(formData);
    const toastId = toast.loading('sending request...');
    const res = await createCounselorAppointmentRequest(payload, session.user.accessToken);
    if (res.success) {
      toast.success('appointment request sent!', { id: toastId });
      fetchData();
      closeModal();
    } else {
      toast.error(`error: ${res.message}`, { id: toastId });
    }
  };

  const handleAccept = async (agenda: AgendaData) => {
    if (!session?.user?.accessToken || !agenda.request_id) return;
    const res = await acceptCounselorAppointmentRequest(agenda.request_id.toString(), session.user.accessToken);
    if (res.success) {
      toast.success('appointment accepted and confirmed!');
      fetchData();
      closeModal();
    }
  };

  const handleDecline = async (agenda: AgendaData) => {
    if (!session?.user?.accessToken || !agenda.request_id) return;
    const res = await declineCounselorAppointmentRequest(agenda.request_id.toString(), session.user.accessToken);
    if (res.success) {
      toast.warning('appointment request declined.');
      fetchData();
      closeModal();
    }
  };

  const initialCreateData = useMemo(() => {
    if (!prefilledDate) return undefined;
    return {
      date: prefilledDate,
      type: 'counseling' as 'counseling' | 'routine_interview',
      startTime: '08:00',
      endTime: '09:00',
      studentId: '',
    };
  }, [prefilledDate]);

  return (
    <div className="flex flex-col h-full">
      {/* breadcrumb and title */}
      <div className="mb-4">
        <div className="flex flex-row space-x-1">
          <Link href="/dashboard" className="font-extrabold text-(--text-muted) hover:text-(--title) transition-colors">
            Dashboard
          </Link>
          <span className="font-regular text-(--text-muted)">
            / Calendar
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-(--title) hidden sm:block">
            Calendar
          </h1>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {isLoading && <p className="text-sm text-gray-500 animate-pulse mb-2">Loading Schedule...</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
          <div className="lg:col-span-2">
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
              onViewRequests={() => setRequestsModalOpen(true)}
              hasPending={hasPending} // pass the derived state here
            />
          </div>
          
          <div className="lg:col-span-1">
            <AgendaComponent
              agendas={listAgendas}
              onAgendaClick={handleAgendaClick}
              onCreateAgenda={handleCreateAgenda}
            />
          </div>
        </div>
      </div>

      {/* modals */}
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
      />
      
      <DayAgendasModal
        isOpen={isDayModalOpen}
        onClose={closeModal}
        date={selectedDayDate}
        agendas={selectedDayAgendas}
        onAgendaClick={handleAgendaClick}
        onCreateAgenda={() => {
          setPrefilledDate(selectedDayDate);
          setCreateModalOpen(true);
          setDayModalOpen(false);
        }}
      />

      <PendingRequestsModal
        isOpen={isRequestsModalOpen}
        onClose={closeModal}
        agendas={listAgendas}
        onAgendaClick={handleAgendaClick}
      />
    </div>
  );
};

export default CalendarClient;