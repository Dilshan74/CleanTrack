import { createContext, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { NOTIFICATIONS } from "../utils/constants";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [items, setItems] = useState(() =>
    NOTIFICATIONS.map((n) => ({ ...n, read: false })),
  );

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  const markAllRead = useCallback(() => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    toast.success("All notifications marked as read");
  }, []);

  const markRead = useCallback((id) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const notify = useCallback((notification) => {
    setItems((current) => [
      { id: Date.now(), read: false, time: "just now", ...notification },
      ...current,
    ]);
    const type = notification.type === "warning" ? "warning" : notification.type;
    const show = toast[type] ?? toast;
    show(notification.title, { description: notification.body });
  }, []);

  const value = useMemo(
    () => ({ items, unreadCount, markRead, markAllRead, notify }),
    [items, unreadCount, markRead, markAllRead, notify],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
