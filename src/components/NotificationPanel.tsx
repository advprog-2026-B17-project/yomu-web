'use client';

import { useNotifications } from '@/context/NotificationContext';

export default function NotificationPanel() {
  const { notifications, isOpen, setIsOpen, markAsRead } = useNotifications();

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m lalu`;
    if (hours < 24) return `${hours}j lalu`;
    return `${days}h lalu`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold">Notifikasi</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm">Belum ada notifikasi</p>
            </div>
          ) : (
            <ul>
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`px-4 py-3 border-b hover:bg-slate-50 cursor-pointer transition-colors ${
                    !notif.is_read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => {
                    if (!notif.is_read) {
                      markAsRead(notif.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`mt-0.5 p-2 rounded-full ${
                      notif.notification_type === 'achievement_unlocked'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {notif.notification_type === 'achievement_unlocked' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${!notif.is_read ? 'font-medium' : ''}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}