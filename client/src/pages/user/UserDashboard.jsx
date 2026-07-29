import { useEffect, useState } from "react";
import { Truck, CalendarCheck, Recycle, MessageSquareWarning } from "lucide-react";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";

function Stat({ icon: Icon, label, value, hint, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
  };
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const firstName = (user?.name || "there").split(" ")[0];

  useEffect(() => {
    userService.getDashboard().then(setData);
  }, []);

  if (!data) return <Loader label="Loading dashboard…" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground">Here&apos;s your collection snapshot for this week.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat icon={Truck} label="Next pickup" value={data.nextPickup?.when ?? "None scheduled"} hint={data.nextPickup ? `${data.nextPickup.time} · ${data.nextPickup.type}` : "No upcoming pickups"} />
        <Stat icon={CalendarCheck} label="This month" value={`${data.monthlyPickups} pickups`} hint="On schedule" />
        <Stat icon={Recycle} label="Recycled" value={`${data.recycledKg} kg`} hint="+12% vs last month" tone="success" />
        <Stat icon={MessageSquareWarning} label="Open complaints" value={data.openComplaints} hint="Being reviewed" tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Upcoming pickups</h2>
          <ul className="divide-y">
            {data.upcoming.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{p.type}</div>
                  <div className="text-sm text-muted-foreground">{p.date} · {p.time}</div>
                </div>
                <span className="text-xs rounded-full bg-success/15 text-success px-2 py-0.5">{p.status}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Recent alerts</h2>
          <ul className="space-y-3 text-sm">
            {data.alerts.map((a) => (
              <li key={a} className="rounded-lg bg-muted p-3">{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
