// components/types/agenda.types.ts

/**
 * This is the unified UI-facing type for all appointments and requests.
 * It's populated by the mappers (appointmentToAgenda, requestToAgenda).
 */
export interface AgendaData {
  // Core fields
  id: string | number; // Use string | number to hold request_id or appointment_id
  title: string;
  date: string;
  type: string;
  startTime: string;
  endTime: string;

  // -----------------------------------------------------------------
  // ⬇️ ADDED FIELDS (Required for Counselor View) ⬇️
  // -----------------------------------------------------------------

  // Status & ID tracking
  status: 'pending' | 'confirmed' | 'declined' | string;
  appointment_id?: string; // ID of a *confirmed* appointment
  request_id?: string;     // ID of a *pending* request

  // User tracking
  counselor_id?: string;
  student_id?: string;
  student_name?: string; // For display in agenda/calendar
  
  /** * Tracks who *created* the request. This is critical for 
   * the AgendaDetailsModal to decide if it should show
   * "Accept/Decline" (if created_by: 'student') or
   * "Delete" (if created_by: 'counselor').
   */
  created_by: 'student' | 'counselor'; 
}

/**
 * ⬆️ NOTE: The 'AgendaForm' type was removed to avoid confusion.
 * The CounselorAgendaModal.tsx file now defines its own
 * 'CounselorAgendaForm' interface, which is more specific
 * for the create/edit form.
 */


/**
 * Your updated color definitions.
 */
export const agendaColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'Counseling': { 
    bg: 'bg-blue-50', 
    border: 'border-blue-300', 
    text: 'text-blue-700', 
    dot: 'bg-blue-500' 
  },
  'Routine Interview': { 
    bg: 'bg-green-50', 
    border: 'border-green-300', 
    text: 'text-green-700', 
    dot: 'bg-green-500' 
  },
  'Meeting': { 
    bg: 'bg-purple-50', 
    border: 'border-purple-300', 
    text: 'text-purple-700', 
    dot: 'bg-purple-500' 
  },
  'Event': { 
    bg: 'bg-orange-50', 
    border: 'border-orange-300', 
    text: 'text-orange-700', 
    dot: 'bg-orange-500' 
  },
  // Adding a default fallback
  'Default': { 
    bg: 'bg-gray-50', 
    border: 'border-gray-300', 
    text: 'text-gray-700', 
    dot: 'bg-gray-500' 
  },
};