export interface Notification {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  data: any | null;
  is_read: boolean;
  delivered_at: string | null;
  is_deleted: boolean;
  created_at: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  hasMore: boolean;
  nextCursor: string | null;
  lastNotificationId: string;
}

export interface NotificationApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
}