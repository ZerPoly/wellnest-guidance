const API_BASE_URL = process.env.NEXT_PUBLIC_HW_USERS_API || '';
// Types for API response
export interface ApiMoodCheckIn {
  check_in_id: string;
  user_id: string;
  mood_1: string;
  mood_2: string;
  mood_3: string;
  checked_in_at: string;
}

export interface StudentApiData {
  classification_id: string;
  student_id: string;
  classification: string;
  is_flagged: boolean;
  classified_at: string;
  user_name: string;
  email: string;
  department_id: string;
  program_name: string;
  department_name: string;
  mood_check_ins: ApiMoodCheckIn[];
}

interface ApiResponse {
  success: boolean;
  code: string;
  message: string;
  data?: StudentApiData;
}

interface Credentials {
  email: string;
  password: string;
}

/**
 * Fetch student classification by ID with credential verification
 * Returns student data if successful, null if failed
 */
export async function fetchStudentClassificationByID(
  studentId: string,
  credentials: Credentials,
  accessToken: string
): Promise<StudentApiData | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/students/${studentId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      }
    );

    const result: ApiResponse = await response.json();

    // Handle different response codes
    if (response.ok && result.success && result.data) {
      return result.data;
    }

    // Log specific error codes for debugging
    if (result.code === 'INVALID_CREDENTIALS') {
      console.error('Invalid credentials provided');
      return null;
    }

    if (result.code === 'FORBIDDEN_ACCESS') {
      console.error('Forbidden: No permission to access this student');
      return null;
    }

    if (result.code === 'STUDENT_NOT_FOUND') {
      console.error('Student not found');
      return null;
    }

    console.error('API Error:', result.message);
    return null;

  } catch (error) {
    console.error('Network error fetching student:', error);
    return null;
  }
}

/**
 * Verify credentials without fetching full student data
 * Used for password validation in the modal
 */
export async function verifyStudentAccess(
  studentId: string,
  credentials: Credentials,
  accessToken: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/students/${studentId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      }
    );

    const result: ApiResponse = await response.json();

    if (response.ok && result.success) {
      return { success: true };
    }

    // Return specific error messages
    if (result.code === 'INVALID_CREDENTIALS') {
      return { success: false, message: 'Invalid password. Please try again.' };
    }

    if (result.code === 'FORBIDDEN_ACCESS') {
      return { success: false, message: 'You do not have permission to access this student.' };
    }

    if (result.code === 'STUDENT_NOT_FOUND') {
      return { success: false, message: 'Student not found.' };
    }

    return { success: false, message: result.message || 'Verification failed.' };

  } catch (error) {
    console.error('Network error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}