import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_HW_USERS_API;

export interface Student {
  classification_id: string;
  student_id: string;
  classification: string;
  is_flagged: boolean;
  classified_at: string;
  email: string;
  department_name: string;
}

export interface StudentsListResponse {
  classifications: Student[];
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Fetch students in counselor's department
 */
export async function getDepartmentStudents(
  accessToken: string,
  cursor?: string,
  limit: number = 50
): Promise<ApiResponse<StudentsListResponse>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/users/students`);
    url.searchParams.append('limit', limit.toString());
    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result: ApiResponse<StudentsListResponse> = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch students:', result.message);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Network error fetching students:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}