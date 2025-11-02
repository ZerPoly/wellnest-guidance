import { StudentProfileResponse } from "@/components/types/studentProfile.type";

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

// ...existing code...

/**
 * Verify credentials without fetching full student data
 * Used for password validation in the modal
 */
export async function verifyStudentAccess(
  studentId: string,
  credentials: Credentials,
  accessToken: string
): Promise<StudentProfileResponse> {
  try {
    console.log("🔐 Verifying access for:", studentId);
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

    const result: StudentProfileResponse = await response.json();

    if (response.ok && result.success && result.data) {
      return { 
        success: true, 
        code: result.code,
        message: result.message,
        data: result.data 
      };
    }

    // Return specific error messages
    if (result.code === 'INVALID_CREDENTIALS') {
      return { 
        success: false, 
        code: result.code,
        message: 'Invalid password. Please try again.', 
        data: undefined
      };
    }

    if (result.code === 'FORBIDDEN_ACCESS') {
      return { 
        success: false, 
        code: result.code,
        message: 'You do not have permission to access this student.', 
        data: undefined
      };
    }

    if (result.code === 'STUDENT_NOT_FOUND') {
      return { 
        success: false, 
        code: result.code,
        message: 'Student not found.', 
        data: undefined
      };
    }

    return { 
      success: false, 
      code: result.code || 'UNKNOWN_ERROR',
      message: result.message || 'Verification failed.', 
      data: undefined
    };

  } catch (error) {
    console.error('Network error:', error);
    return { 
      success: false, 
      code: 'NETWORK_ERROR',
      message: 'Network error. Please try again.',
      data: undefined 
    };
  }
}