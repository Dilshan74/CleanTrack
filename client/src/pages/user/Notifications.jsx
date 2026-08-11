import { useEffect, useState } from "react";
import { Bell, CalendarClock, AlertCircle, CheckCheck, Inbox } from "lucide-react";
import Loader from "../../components/common/Loader";
import userService from "../../services/userService";
import api from "../../services/api";

const toneStyles = {
  primary:     "bg-primary/10 text-primary",
  success:     "bg-success/10 text-success",
  warning:     "bg-warning/10 text-warning-foreground",
  destructive: "bg-destructive/10 text-destructive",
  muted:       "bg-muted text-muted-foreground",
};

const dotColor = {
  primary:     "bg-primary",
  success:     "bg-success",
  warning:     "bg-warning",
  destructive: "bg-destructive",
  muted:       "bg-muted-foreground",
};

function NotifIcon({ type, tone }) {
  const cls = `h-4 w-4`;
  if (type === "Route")   return <CalendarClock className={cls} />;
  if (type === "Request") return <AlertCircle className={cls} />;
  return <Bell className={cls} />;
}

export default function Notifications() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    userService.getNotifications().then(setItems);
  }, []);

  async function markAllRead() {
    // Optimistic UI update
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    // Mark stored DB notifications as read (ignore errors — synthesized ones have no DB id)
    try {
      if (items) {
        const storedIds = items
          .filter((n) => n.unread && !String(n.id).startsWith("complaint-") && !String(n.id).startsWith("schedule-"))
          .map((n) => n.id);
        await Promise.all(storedIds.map((id) => api.put(`/notifications/${id}/read`)));
      }
    } catch (_) {}
  }

  const unreadCount = items ? items.filter((n) => n.unread).length : 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Reminders, complaint updates, and schedule changes.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-medium">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={markAllRead}
            disabled={!items || unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 transition-opacity"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        </div>
      </div>

      {!items ? (
        <Loader label="Loading notifications..." />
      ) : items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Inbox className="h-10 w-10 opacity-30" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex gap-3 p-4 transition-colors ${n.unread ? "bg-secondary/40" : ""}`}
            >
              {/* Icon */}
              <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneStyles[n.tone] || toneStyles.muted}`}>
                <NotifIcon type={n.type} tone={n.tone} />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.unread && (
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor[n.tone] || dotColor.muted}`} />
                    )}
                    <span className="font-medium text-sm">{n.title}</span>
                    {n.type && (
                      <span className="text-xs rounded-full px-2 py-0.5 bg-muted text-muted-foreground capitalize">
                        {n.type === "Request" ? "Complaint" : n.type === "Route" ? "Schedule" : n.type}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">{n.time}</div>
                    {n.date && <div className="text-xs text-muted-foreground">{n.date}</div>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
