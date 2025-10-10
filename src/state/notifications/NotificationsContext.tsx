import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { connect, disconnect } from '../../services/notification.service';

export type NotificationItem = {
  title: string;
  description: string;
  url: string;
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  onlineUsers: unknown[];
  pushNotification: (item: NotificationItem) => void;
  removeNotification: (index: number) => void;
  connect: () => void;
  disconnect: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<unknown[]>([]);

  const pushNotification = useCallback<NotificationsContextValue['pushNotification']>((item) => {
    setNotifications((prev) => {
      const next = [...prev, item];
      if (next.length <= 3) {
        return next;
      }
      return next.slice(next.length - 3);
    });
  }, []);

  const removeNotification = useCallback<NotificationsContextValue['removeNotification']>((index) => {
    setNotifications((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const connectNotifications = useCallback(() => {
    connect({
      onNotification: pushNotification,
      onOnlineUpdate: setOnlineUsers,
    });
  }, [pushNotification]);

  const disconnectNotifications = useCallback(() => {
    disconnect();
  }, []);

  useEffect(() => () => {
    disconnect();
  }, []);

  const value = useMemo<NotificationsContextValue>(() => ({
    notifications,
    onlineUsers,
    pushNotification,
    removeNotification,
    connect: connectNotifications,
    disconnect: disconnectNotifications,
  }), [notifications, onlineUsers, pushNotification, removeNotification, connectNotifications, disconnectNotifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
