import React, { useEffect } from 'react';

export interface NotificationData {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const bgColor = {
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-rose-500'
  }[notification.type];

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300 pointer-events-auto`}>
      <span className="font-medium text-sm tracking-wide">{notification.message}</span>
      <button onClick={() => onClose(notification.id)} className="hover:opacity-75 transition-opacity opacity-50 cursor-pointer">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function NotificationsContainer({ notifications, onClose }: { notifications: NotificationData[], onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-80 max-w-[calc(100vw-32px)]">
      {notifications.map(n => (
        <NotificationItem key={n.id} notification={n} onClose={onClose} />
      ))}
    </div>
  );
}
