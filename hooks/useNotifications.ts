import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Notification } from '@/lib/api/types/notification.types';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/lib/api/notifications';

export function useNotifications() {
  const { data: session, status } = useSession(); 
  
  // ✅ FIX: Check for studentToken, adminToken, or counselorToken. 
  // It will grab whichever one exists on the current user's session!
  const accessToken =  session?.adminToken || session?.counselorToken;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const fetchNotifications = useCallback(async (reset = false) => {
    if (!accessToken) return;
    setLoading(true);
    const result = await getNotifications(accessToken, 20, reset ? undefined : cursor);
    if (result.success && result.data) {
      setNotifications(prev =>
        reset ? result.data!.notifications : [...prev, ...result.data!.notifications]
      );
      setHasMore(result.data.hasMore);
      setCursor(result.data.nextCursor ?? undefined);
    }
    setLoading(false);
  }, [accessToken, cursor]);

  const fetchUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    const result = await getUnreadCount(accessToken);
    if (result.success && result.data) {
      setUnreadCount(result.data.count);
    }
  }, [accessToken]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!accessToken) return;
    await markAsRead(notificationId, accessToken);
    setNotifications(prev =>
      prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    if (!accessToken) return;
    await markAllAsRead(accessToken);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (notificationId: string) => {
    if (!accessToken) return;
    await deleteNotification(notificationId, accessToken);
    setNotifications(prev =>
      prev.filter(n => n.notification_id !== notificationId)
    );
  };

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) return;
    fetchNotifications(true);
    fetchUnreadCount();
  }, [accessToken, status]); 

  return {
    notifications,
    unreadCount,
    hasMore,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    loadMore: () => fetchNotifications(false),
  };
}