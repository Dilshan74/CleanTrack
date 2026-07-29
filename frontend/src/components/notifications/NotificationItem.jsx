import { AlertTriangle, Bell, CheckCircle2, CloudRain, Info } from "lucide-react";
import { cn } from "../../utils/helpers";

const ICONS = { success: CheckCircle2, warning: AlertTriangle, info: Info };
const TINTS = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
};

export default function NotificationItem({ notification, onRead }) {
  const { type = "info", title, body, time, read } = notification;
  const isWeather = title?.toLowerCase().includes("weather");
  const Icon = isWeather ? CloudRain : (ICONS[type] ?? Info);

  return (
    <button
      type="button"
      onClick={() => onRead?.(notification.id)}
      className={cn(
        "soft-shadow grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/30",
        !read && "border-primary/30",
      )}
    >
      <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", TINTS[type])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-semibold">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          {title}
          {!read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      <div className="whitespace-nowrap text-xs text-muted-foreground">{time}</div>
    </button>
  );
}
