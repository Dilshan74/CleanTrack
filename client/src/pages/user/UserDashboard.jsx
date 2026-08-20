import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, CalendarCheck, Recycle, MessageSquareWarning,
  Bell, AlertCircle, Inbox, ChevronRight, TrendingUp, TrendingDown
} from "lucide-react";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import userService from "../../services/userService";

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  Scheduled: "bg-success/15 text-success",
  "In Progress": "bg-blue-500/15 text-blue-600",
  Completed: "bg-muted text-muted-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
  Inactive: "bg-warning/20 text-warning-foreground",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-muted text-muted-foreground";
  return (
    <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, hint, tone = "primary", onClick }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    muted:   "bg-muted text-muted-foreground",
  };
  return (
    <div
      className={`rounded-xl border bg-card p-5 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
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

// ── Collection Area card (replaces "Next Pickup") ─────────────────────────────
function CollectionAreaCard({ area }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">My Collection Area</span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </span>
      </div>
      {area ? (
        <div className="mt-2 space-y-0.5">
          {area.city    && <div className="text-lg font-bold leading-tight">{area.city}</div>}
          {area.address && <div className="text-sm text-muted-foreground truncate">{area.address}</div>}
          <div className="text-xs text-primary font-medium mt-1">Route: {area.routeName}</div>
        </div>
      ) : (
        <div className="mt-2 text-sm text-muted-foreground">No collection area assigned</div>
      )}
    </div>
  );
}

// ── Recycled hint text ────────────────────────────────────────────────────────
function recycledHint(kg, kgLast, available) {
  if (!available) return "Weight data unavailable";
  if (kgLast === null) return null; // hide when no comparison data
  if (kgLast === 0)    return null; // avoid divide-by-zero display
  const pct = (((kg - kgLast) / kgLast) * 100).toFixed(0);
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct}% vs last month`;
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);   // null = loading / error
  const [error,   setError]   = useState(false);
  const firstName = (user?.name || "there").split(" ")[0];

  useEffect(() => {
    userService.getDashboard().then((result) => {
      if (result === null) {
        setError(true);
      } else {
        setData(result);
      }
    });
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!data && !error) return <Loader label="Loading dashboard…" />;

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive opacity-70" />
        <div>
          <p className="font-semibold text-base">Unable to load dashboard data</p>
          <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
        </div>
        <button
          onClick={() => { setError(false); setData(null); userService.getDashboard().then(r => r === null ? setError(true) : setData(r)); }}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const {
    collectionArea,
    monthlyPickups,
    recycledKg,
    recycledKgLastMonth,
    weightDataAvailable,
    openComplaints,
    upcomingPickups,
    recentAlerts,
  } = data;

  const recycledHintText = recycledHint(recycledKg, recycledKgLastMonth, weightDataAvailable);

  const recycledValue = weightDataAvailable
    ? `${recycledKg} kg`
    : "0 kg";

  const recycledTrendIcon = recycledKgLastMonth !== null && weightDataAvailable
    ? recycledKg >= recycledKgLastMonth
      ? <TrendingUp className="inline h-3 w-3 mr-0.5" />
      : <TrendingDown className="inline h-3 w-3 mr-0.5" />
    : null;

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground">Here&apos;s your collection snapshot for this month.</p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Card 1 — Collection Area */}
        <CollectionAreaCard area={collectionArea} />

        {/* Card 2 — This Month (clickable → /user/schedule) */}
        <StatCard
          icon={CalendarCheck}
          label="This month"
          value={`${monthlyPickups} pickup${monthlyPickups !== 1 ? "s" : ""}`}
          hint={monthlyPickups > 0 ? "On schedule" : "No pickups this month"}
          onClick={() => navigate("/user/schedule")}
        />

        {/* Card 3 — Recycled */}
        <StatCard
          icon={Recycle}
          label="Recycled"
          value={recycledValue}
          hint={
            recycledHintText
              ? <>{recycledTrendIcon}{recycledHintText}</>
              : recycledHintText
          }
          tone="success"
        />

        {/* Card 4 — Open Complaints */}
        <StatCard
          icon={MessageSquareWarning}
          label="Open complaints"
          value={openComplaints}
          hint={openComplaints > 0 ? "Being reviewed" : "No open complaints"}
          tone="warning"
        />
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Upcoming Pickups ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Upcoming pickups</h2>

          {upcomingPickups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
              <Inbox className="h-9 w-9 opacity-30" />
              <div className="text-center">
                <p className="text-sm font-medium">No upcoming collection schedules</p>
                <p className="text-xs mt-0.5">
                  There are currently no collection schedules assigned to your area.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y">
              {upcomingPickups.map((p) => (
                <li key={String(p.id)} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-sm">{p.routeName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.date}
                      {p.time && p.time !== "N/A" ? ` · ${p.time}` : ""}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Alerts — entire section navigates to Notifications ──────── */}
        <div
          className="rounded-xl border bg-card p-5 cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => navigate("/user/notifications")}
          role="button"
          aria-label="View all notifications"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent alerts</h2>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>

          {recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <Bell className="h-7 w-7 opacity-30" />
              <p className="text-xs">No recent alerts</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentAlerts.map((a) => (
                <li
                  key={String(a.id)}
                  className="rounded-lg bg-muted p-3 text-sm leading-snug"
                >
                  {a.title && (
                    <div className="font-medium text-xs text-muted-foreground mb-0.5">{a.title}</div>
                  )}
                  <div>{a.message}</div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-primary mt-3 text-right">
            View all notifications →
          </p>
        </div>
      </div>
    </div>
  );
}
