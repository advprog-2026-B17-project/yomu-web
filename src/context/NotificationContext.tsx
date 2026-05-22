"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  apiRequest,
  apiRoutes,
  formatApiError,
  NotificationRow,
} from "@/lib/api";

export type Notification = NotificationRow;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
  userId,
  token,
}: {
  children: ReactNode;
  userId: string;
  token: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const [notificationsData, countData] = await Promise.all([
        apiRequest<NotificationRow[]>(apiRoutes.notifications.byUser(userId), {
          token,
        }),
        apiRequest<{ count: number }>(
          apiRoutes.notifications.unreadCount(userId),
          { token },
        ),
      ]);
      setNotifications(notificationsData);
      setUnreadCount(countData.count);
    } catch (err) {
      console.error(formatApiError(err, "Failed to fetch notifications"));
    }
  }, [userId, token]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await apiRequest(apiRoutes.notifications.read(id), {
          method: "PUT",
          token,
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(
          formatApiError(err, "Failed to mark notification as read"),
        );
      }
    },
    [token],
  );

  useEffect(() => {
    if (userId) {
      refresh();
      // Poll every 30 seconds
      const interval = setInterval(refresh, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, refresh]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        setIsOpen,
        markAsRead,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return context;
}
