import { ApiResponse, Appointment, AppointmentRequest } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_HW_BOOKING_API;

export interface CreateCounselorRequestPayload {
  agenda: 'counseling' | 'routine_interview';
  studentId: string;
  proposedStart: string; // ISO 8601
  proposedEnd: string; // ISO 8601
}

/**
 * Create appointment request (POST /counselor/requests/)
 */
export async function createCounselorAppointmentRequest(
  payload: CreateCounselorRequestPayload,
  accessToken: string
): Promise<ApiResponse<AppointmentRequest>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/booking/counselor/requests/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result: ApiResponse<AppointmentRequest> = await response.json();

    if (!response.ok) {
      console.error('Failed to create counselor appointment request:', result.message);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Network error creating counselor appointment request:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}

/**
 * Get all counselor appointment requests (GET /counselor/requests/)
 */
export async function getCounselorAppointmentRequests(
  accessToken: string,
  status?: 'pending' | 'both_confirmed' | 'declined' | 'expired'
): Promise<ApiResponse<AppointmentRequest[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/booking/counselor/requests/`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result: ApiResponse<AppointmentRequest[]> = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch counselor appointment requests:', result.message);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Network error fetching counselor appointment requests:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}

/**
 * Accept appointment request (PATCH /counselor/requests/{requestId}/accept)
 */
export async function acceptCounselorAppointmentRequest(
  requestId: string,
  accessToken: string
): Promise<ApiResponse<Appointment>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/booking/counselor/requests/${requestId}/accept`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const result: ApiResponse<Appointment> = await response.json();

    if (!response.ok) {
      console.error('Failed to accept counselor appointment request:', result.message);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Network error accepting counselor appointment request:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}

/**
 * Decline appointment request (PATCH /counselor/requests/{requestId}/decline)
 */
export async function declineCounselorAppointmentRequest(
  requestId: string,
  accessToken: string
): Promise<ApiResponse<AppointmentRequest>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/booking/counselor/requests/${requestId}/decline`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const result: ApiResponse<AppointmentRequest> = await response.json();

    if (!response.ok) {
      console.error('Failed to decline counselor appointment request:', result.message);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Network error declining counselor appointment request:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}