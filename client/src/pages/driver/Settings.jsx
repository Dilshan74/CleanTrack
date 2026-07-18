import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import driverService from "../../services/driverService";

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
  const [profile, setProfile] = useState(null);
  const [prefs, setPrefs] = useState({
    shareLocation: true,
    routeAlerts: true,
    autoStatusSync: false,
  });

  useEffect(() => {
    driverService.getProfile().then(setProfile);
  }, []);

  function set(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (!profile) return <Loader label="Loading settings…" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Tracking preferences and account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-2">Preferences</h2>
          <div className="divide-y">
            <Toggle label="Share live location" description="Allow dispatch to track your position on shift." checked={prefs.shareLocation} onChange={(v) => set("shareLocation", v)} />
            <Toggle label="Route alerts" description="Notify me of route and stop changes." checked={prefs.routeAlerts} onChange={(v) => set("routeAlerts", v)} />
            <Toggle label="Auto status sync" description="Auto-mark stops as collected when I arrive." checked={prefs.autoStatusSync} onChange={(v) => set("autoStatusSync", v)} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">Driver</div>
              <div className="font-medium">{user?.name} · {profile.license}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-muted-foreground text-xs">Truck</div><div className="font-medium">{profile.truck}</div></div>
              <div><div className="text-muted-foreground text-xs">Route</div><div className="font-medium">{profile.route}</div></div>
              <div><div className="text-muted-foreground text-xs">Shift</div><div className="font-medium">{profile.shift}</div></div>
              <div><div className="text-muted-foreground text-xs">Phone</div><div className="font-medium">{profile.phone}</div></div>
            </div>
            <div className="pt-2">
              <button onClick={handleLogout} className="rounded-lg border px-4 py-2 text-sm text-destructive hover:bg-destructive/10">Log out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
