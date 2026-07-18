import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

/**
 * Notification bell with an unread indicator. Links to the given route.
 *   <NotificationBell to="/user/notifications" count={2} />
 */
export default function NotificationBell({ to = "#", count = 0 }) {
  return (
    <Link
      to={to}
      aria-label={`Notifications${count ? ` (${count} unread)` : ""}`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
    >
      <Bell className="h-5 w-5 text-muted-foreground" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
