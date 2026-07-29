import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cloud,
  Droplets,
  FileText,
  MapPinned,
  Sparkles,
  ThermometerSun,
  Upload,
} from "lucide-react";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import useNotification from "../../../hooks/useNotification";
import {
  CITIZEN_REPORTS,
  PREVENTION_TIPS,
  STATUS_TINT,
  WEATHER,
} from "../../../utils/constants";

export default function Dashboard() {
  const { items: notifications } = useNotification();

  return (
    <>
      <PageHeader
        title="Welcome back, Nimal 👋"
        description="Here's what's happening in your area today."
        action={
          <div className="flex flex-wrap gap-2">
            <Button as={Link} to="/citizen/map" variant="outline">
              <MapPinned className="h-4 w-4" /> Risk Map
            </Button>
            <Button as={Link} to="/citizen/upload">
              <Upload className="h-4 w-4" /> New Report
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Reports Submitted" value={12} delta="+2 this week" icon={FileText} tint="primary" />
        <StatCard label="Pending Reports" value={3} delta="Awaiting review" icon={Clock} tint="warning" />
        <StatCard label="Approved Reports" value={7} delta="+3 this month" icon={CheckCircle2} tint="success" />
        <StatCard label="High Risk Areas Nearby" value={2} delta="Within 2 km" icon={AlertTriangle} tint="destructive" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="soft-shadow rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Button as={Link} to="/citizen/track" variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="space-y-3">
            {CITIZEN_REPORTS.slice(0, 4).map((report) => (
              <Link
                key={report.id}
                to={`/citizen/track/${report.id}`}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-background p-3 hover:bg-muted/40"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-xl">
                  {report.image}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span>{report.id}</span>
                    <Badge className={STATUS_TINT[report.status]}>{report.status}</Badge>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {report.location} · {report.date}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">{report.updated}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="soft-shadow rounded-2xl border border-border bg-gradient-to-br from-info/10 to-primary/10 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Today&apos;s Weather</h3>
              <Cloud className="h-5 w-5 text-info" />
            </div>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold">{WEATHER.temp}°</div>
              <div className="pb-1">
                <div className="text-sm font-medium">{WEATHER.condition}</div>
                <div className="text-xs text-muted-foreground">{WEATHER.city}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-info" /> Humidity {WEATHER.humidity}%
              </div>
              <div className="flex items-center gap-2">
                <ThermometerSun className="h-4 w-4 text-warning" /> Rain {WEATHER.rain}%
              </div>
            </div>
          </div>

          <div className="soft-shadow rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Latest Notifications</h3>
              <Button as={Link} to="/citizen/notifications" variant="ghost" size="sm">
                All
              </Button>
            </div>
            <div className="space-y-2.5">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={
                      notification.type === "warning"
                        ? "mt-1 h-2 w-2 shrink-0 rounded-full bg-warning"
                        : notification.type === "success"
                          ? "mt-1 h-2 w-2 shrink-0 rounded-full bg-success"
                          : "mt-1 h-2 w-2 shrink-0 rounded-full bg-info"
                    }
                  />
                  <div className="min-w-0">
                    <div className="font-medium">{notification.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {notification.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="soft-shadow mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Dengue Prevention Tips</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PREVENTION_TIPS.map((tip, index) => (
            <div key={tip} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-2 grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </div>
              <p className="text-sm text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
