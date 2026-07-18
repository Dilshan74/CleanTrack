import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Loader from "../../components/common/Loader";
import userService from "../../services/userService";

const dot = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground",
};

export default function Notifications() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    userService.getNotifications().then(setItems);
  }, []);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Reminders, complaint updates, and schedule changes.</p>
        </div>
        <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      {!items ? (
        <Loader label="Loading notifications…" />
      ) : (
        <div className="rounded-xl border bg-card divide-y">
          {items.map((n) => (
            <div key={n.id} className={`flex gap-3 p-4 ${n.unread ? "bg-secondary/40" : ""}`}>
              <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {n.unread && <span className={`h-2 w-2 rounded-full ${dot[n.tone] || dot.muted}`} />}
                  <span className="font-medium">{n.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
