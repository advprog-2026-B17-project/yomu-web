'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children, userId, token }: { children: ReactNode; userId: string; token: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        fetch(`${apiUrl}/api/notifications/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/notifications/${userId}/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (notifsRes.ok) {
        const data = await notifsRes.json();
        setNotifications(data);
      }
      if (countRes.ok) {
        const data = await countRes.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [userId, token, apiUrl]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/notifications/read/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    if (userId) {
      refresh();
      // Poll every 30 seconds
      const interval = setInterval(refresh, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, refresh]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isOpen, setIsOpen, markAsRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}