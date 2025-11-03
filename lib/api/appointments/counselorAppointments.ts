import { ApiResponse, Appointment, UnavailableSlot, AvailableSlot } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_HW_BOOKING_API;

/**
 * Get all confirmed counselor appointments (GET /counselor/appointments/)
 */
export async function getCounselorConfirmedAppointments(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<ApiResponse<Appointment[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/booking/counselor/appointments/`);
    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result: ApiResponse<Appointment[]> = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch counselor confirmed appointments:', result.message);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Network error fetching counselor confirmed appointments:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}

/**
 * Get counselor unavailable slots (GET /counselor/availability/)
 */
export async function getCounselorUnavailableSlots(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<ApiResponse<UnavailableSlot[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/booking/counselor/availability/`);
    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result: ApiResponse<UnavailableSlot[]> = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch counselor unavailable slots:', result.message);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Network error fetching counselor unavailable slots:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}

/**
 * Get department available slots (GET /counselor/availability/department)
 */
export async function getCounselorDepartmentAvailableSlots(
  accessToken: string,
  startDate: string,
  endDate: string,
  slotDuration: number = 60,
  workStartHour: number = 9,
  workEndHour: number = 17
): Promise<ApiResponse<AvailableSlot[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/booking/counselor/availability/department`);
    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);
    url.searchParams.append('slotDuration', slotDuration.toString());
    url.searchParams.append('workStartHour', workStartHour.toString());
    url.searchParams.append('workEndHour', workEndHour.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result: ApiResponse<AvailableSlot[]> = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch counselor department available slots:', result.message);
      return result;
    }

    return result;
  } catch (error) {
    console.error('Network error fetching counselor department available slots:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server. Please try again.',
    };
  }
}