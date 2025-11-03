// lib/api/appointments/types.ts

// ------------------------------------------------------------------
// API Response Wrappers
// ------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
}

// ------------------------------------------------------------------
// Main Data Models
// ------------------------------------------------------------------

/**
 * A pending request for an appointment.
 */
export interface AppointmentRequest {
  request_id: string;
  student_id: string;
  counselor_id: string;
  department: string;
  agenda: 'counseling' | 'routine_interview' | 'meeting' | 'event';
  proposed_start: string; // ISO 8601
  proposed_end: string; // ISO 8601
  proposed_by: 'student' | 'counselor';
  created_by: 'student' | 'counselor';
  student_response: 'pending' | 'accepted' | 'declined';
  counselor_response: 'pending' | 'accepted' | 'declined';
  status: 'pending' | 'both_confirmed' | 'declined' | 'expired';
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * A finalized, confirmed appointment.
 */
export interface Appointment {
  appointment_id: string;
  student_id: string;
  counselor_id: string;
  department: string;
  agenda: 'counseling' | 'routine_interview' | 'meeting' | 'event';
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  google_event_id: string;
  status: 'both_confirmed'; // Note: This is specific
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  request_id: string;
}

// ------------------------------------------------------------------
// Availability Models
// ------------------------------------------------------------------

export interface UnavailableSlot {
  start: string; // ISO 8601
  end: string; // ISO 8601
  agenda: string;
  student_email?: string; // From counselorAppointments.ts
}

export interface AvailableSlot {
  start: string; // ISO 8601
  end: string; // ISO 8601
}

// ------------------------------------------------------------------
// API Payloads
// ------------------------------------------------------------------

/**
 * Payload for POST /student/requests/
 * (Kept for reference)
 */
export interface CreateStudentRequestPayload {
  agenda: 'counseling' | 'routine_interview';
  counselorId: string;
  proposedStart: string; // ISO 8601
  proposedEnd: string; // ISO 8601
}

/**
 * Payload for POST /counselor/requests/
 * (From your counselorRequests.ts)
 */
export interface CreateCounselorRequestPayload {
  agenda: 'counseling' | 'routine_interview';
  studentId: string;
  proposedStart: string; // ISO 8601
  proposedEnd: string; // ISO 8601
}