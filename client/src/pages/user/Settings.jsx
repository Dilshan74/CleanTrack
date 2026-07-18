import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-medium text-sm">{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pickupReminders: true,
  });

  function set(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Notification preferences and account security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-2">Notifications</h2>
          <div className="divide-y">
            <Toggle label="Email alerts" description="Pickup and complaint updates by email." checked={prefs.emailAlerts} onChange={(v) => set("emailAlerts", v)} />
            <Toggle label="SMS alerts" description="Text reminders before collection day." checked={prefs.smsAlerts} onChange={(v) => set("smsAlerts", v)} />
            <Toggle label="Pickup reminders" description="Notify me the evening before pickup." checked={prefs.pickupReminders} onChange={(v) => set("pickupReminders", v)} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">Signed in as</div>
              <div className="font-medium">{user?.name} · {user?.email}</div>
            </div>
            <label className="block">
              <span className="text-muted-foreground">Change password</span>
              <input type="password" placeholder="New password" className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <div className="flex gap-2 pt-2">
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Update password</button>
              <button onClick={handleLogout} className="rounded-lg border px-4 py-2 text-sm text-destructive hover:bg-destructive/10">Log out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
