import { NotificationApiResponse, PaginatedNotifications } from "./types/notification.types";


const API_BASE_URL = process.env.NEXT_PUBLIC_HW_NOTIFICATION_API;

/** GET /notification/ — paginated */
export async function getNotifications(
  accessToken: string,
  limit = 20,
  lastNotificationId?: string
): Promise<NotificationApiResponse<PaginatedNotifications>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/notification`);
    url.searchParams.append('limit', limit.toString());
    if (lastNotificationId) {
      url.searchParams.append('lastNotificationId', lastNotificationId);
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return await response.json();
  } catch {
    return { success: false, code: 'NETWORK_ERROR', message: 'Failed to connect.' };
  }
}

/** GET /notification/unread */
export async function getUnreadNotifications(
  accessToken: string
): Promise<NotificationApiResponse<Notification[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/notification/unread`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await response.json();
  } catch {
    return { success: false, code: 'NETWORK_ERROR', message: 'Failed to connect.' };
  }
}

/** GET /notification/unread/count */
export async function getUnreadCount(
  accessToken: string
): Promise<NotificationApiResponse<{ count: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/notification/unread/count`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await response.json();
  } catch {
    return { success: false, code: 'NETWORK_ERROR', message: 'Failed to connect.' };
  }
}

/** PATCH /notification/read-all */
export async function markAllAsRead(
  accessToken: string
): Promise<NotificationApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/notification/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await response.json();
  } catch {
    return { success: false, code: 'NETWORK_ERROR', message: 'Failed to connect.' };
  }
}

/** PATCH /notification/{notificationId}/read */
export async function markAsRead(
  notificationId: string,
  accessToken: string
): Promise<NotificationApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/notification/${notificationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await response.json();
  } catch {
    return { success: false, code: 'NETWORK_ERROR', message: 'Failed to connect.' };
  }
}

/** DELETE /notification/{notificationId} */
export async function deleteNotification(
  notificationId: string,
  accessToken: string
): Promise<NotificationApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/notification/${notificationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await response.json();
  } catch {
    return { success: false, code: 'NETWORK_ERROR', message: 'Failed to connect.' };
  }
}