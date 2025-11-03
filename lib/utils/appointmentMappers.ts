// lib/utils/appointmentMappers.ts

import { Appointment, AppointmentRequest, CreateCounselorRequestPayload } from '../api/appointments/types';
import { AgendaData } from '@/components/types/agenda.types';
import { Student } from '@/lib/api/appointments/students'; // Import your new Student type

// --- Helper Functions (remain the same) ---

/**
 * Extracts HH:MM from ISO string (e.g., "2025-11-15T14:00:00.000Z" -> "14:00")
 */
function extractHHMMFromISO(isoTime: string): string {
    const match = isoTime.match(/T(\d{2}:\d{2}):\d{2}/);
    return match ? match[1] : '00:00'; 
}

function formatAgendaTitle(agenda: string): string {
    const titleMap: Record<string, string> = { 'counseling': 'Counseling Session', 'routine_interview': 'Routine Interview', 'meeting': 'Meeting', 'event': 'Event', };
    return titleMap[agenda] || 'Consultation';
}

function formatAgendaType(agenda: string): string {
    const typeMap: Record<string, string> = { 'counseling': 'Counseling', 'routine_interview': 'Routine Interview', 'meeting': 'Meeting', 'event': 'Event', };
    return typeMap[agenda] || 'Meeting';
}

function formatTypeToAgenda(type: string): 'counseling' | 'routine_interview' {
    const agendaMap: Record<string, 'counseling' | 'routine_interview'> = { 'Counseling': 'counseling', 'Routine Interview': 'routine_interview', };
    return agendaMap[type] || 'counseling';
}

// --- Main Mappers (Updated) ---

/**
 * Convert API Appointment to UI AgendaData
 */
export function appointmentToAgenda(
  appointment: Appointment,
  studentMap: Map<string, Student> // Use your Student type
): AgendaData {
  const startDate = new Date(appointment.start_time);
  const student = studentMap.get(appointment.student_id);

  return {
    id: appointment.appointment_id,
    appointment_id: appointment.appointment_id,
    title: formatAgendaTitle(appointment.agenda),
    date: startDate.toISOString().split('T')[0], 
    type: formatAgendaType(appointment.agenda),
    startTime: extractHHMMFromISO(appointment.start_time),
    endTime: extractHHMMFromISO(appointment.end_time),
    status: 'confirmed',
    counselor_id: appointment.counselor_id,
    
    // Add student info
    student_id: appointment.student_id,
    student_name: student?.user_name || 'Unknown Student',
    
    // This is less critical for confirmed items, but good to have
    // We'd need to fetch the original request to know 'created_by' for sure,
    // so we'll default it. The 'pending' items are more important.
    created_by: 'student', 
  };
}

/**
 * Convert API AppointmentRequest to UI AgendaData
 */
export function requestToAgenda(
  request: AppointmentRequest,
  studentMap: Map<string, Student> // Use your Student type
): AgendaData {
  const startDate = new Date(request.proposed_start);
  const student = studentMap.get(request.student_id);

  return {
    id: request.request_id,
    request_id: request.request_id,
    title: formatAgendaTitle(request.agenda),
    date: startDate.toISOString().split('T')[0],
    type: formatAgendaType(request.agenda),
    startTime: extractHHMMFromISO(request.proposed_start),
    endTime: extractHHMMFromISO(request.proposed_end),
    status: request.status as any,
    counselor_id: request.counselor_id,
    
    // Add student info and CRITICAL created_by field
    student_id: request.student_id,
    student_name: student?.user_name || 'Unknown Student',
    created_by: request.created_by, 
  };
}

/**
 * ⬇️ UPDATED ⬇️
 * Convert Counselor UI form data to API payload
 */
export function counselorAgendaFormToApiPayload(
  formData: { 
    date: string; 
    type: 'counseling' | 'routine_interview'; 
    startTime: string; 
    endTime: string; 
    studentId: string;
  }
): CreateCounselorRequestPayload {
  
  // Create local ISO-like string (no 'Z')
  const proposedStart = `${formData.date}T${formData.startTime}:00`; 
  const proposedEnd = `${formData.date}T${formData.endTime}:00`;

  return {
    agenda: formData.type, // Type is already 'counseling' | 'routine_interview'
    studentId: formData.studentId,
    proposedStart,
    proposedEnd,
  };
}

/**
 * Get date range for API calls (remains the same)
 */
export function getMonthDateRange(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(year, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}