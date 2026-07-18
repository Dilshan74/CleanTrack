import NotificationBell from "./NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import { initials } from "../../utils/helpers";

/**
 * Top bar for dashboard layouts.
 *   <Navbar role="User" title="Resident Portal" notificationsTo="/user/notifications" count={2} />
 */
export default function Navbar({ role, title, notificationsTo = "#", count = 0 }) {
  const { user } = useAuth();

  return (
    <header className="h-16 shrink-0 border-b bg-card px-6 flex items-center justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {role}
        </div>
        <div className="font-semibold">{title}</div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell to={notificationsTo} count={count} />
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {initials(user?.name)}
          </span>
          <div className="leading-tight hidden sm:block">
            <div className="text-sm font-medium">{user?.name || "Guest"}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {user?.role || "—"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
