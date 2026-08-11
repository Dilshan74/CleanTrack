import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import userService from "../../services/userService";

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

  useEffect(() => {
    userService.getProfile().then(data => {
      if (data?.preferences) {
        setPrefs(data.preferences);
      }
    });
  }, []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwStatus, setPwStatus] = useState(null); // { type: "success"|"error", msg }
  const [pwLoading, setPwLoading] = useState(false);

  async function set(key, value) {
    const nextPrefs = { ...prefs, [key]: value };
    setPrefs(nextPrefs);
    try {
      await userService.updatePreferences(nextPrefs);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPwStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwStatus({ type: "error", msg: "All password fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      setPwStatus({ type: "error", msg: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (currentPassword === newPassword) {
      setPwStatus({ type: "error", msg: "New password must be different from the current one." });
      return;
    }

    setPwLoading(true);
    try {
      const res = await userService.changePassword(currentPassword, newPassword);
      setPwStatus({ type: "success", msg: res?.message || "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update password. Please try again.";
      setPwStatus({ type: "error", msg });
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Notification preferences and account security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notifications */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-2">Notifications</h2>
          <div className="divide-y">
            <Toggle label="Email alerts" description="Pickup and complaint updates by email." checked={prefs.emailAlerts} onChange={(v) => set("emailAlerts", v)} />
            <Toggle label="SMS alerts" description="Text reminders before collection day." checked={prefs.smsAlerts} onChange={(v) => set("smsAlerts", v)} />
            <Toggle label="Pickup reminders" description="Notify me the evening before pickup." checked={prefs.pickupReminders} onChange={(v) => set("pickupReminders", v)} />
          </div>
        </div>

        {/* Account / Password */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Account</h2>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Signed in as</div>
              <div className="font-medium">{user?.name} <span className="text-muted-foreground font-normal">&#183;</span> {user?.email}</div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">Change password</div>

              {/* Current password */}
              <label className="block">
                <span className="text-muted-foreground text-xs">Current password</span>
                <div className="relative mt-1">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setPwStatus(null); }}
                    placeholder="Enter current password"
                    className="w-full rounded-lg border bg-background px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {/* New password */}
              <label className="block">
                <span className="text-muted-foreground text-xs">New password</span>
                <div className="relative mt-1">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPwStatus(null); }}
                    placeholder="At least 6 characters"
                    className="w-full rounded-lg border bg-background px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {/* Confirm new password */}
              <label className="block">
                <span className="text-muted-foreground text-xs">Confirm new password</span>
                <div className="relative mt-1">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPwStatus(null); }}
                    placeholder="Re-enter new password"
                    className="w-full rounded-lg border bg-background px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {/* Status message */}
              {pwStatus && (
                <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${pwStatus.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {pwStatus.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {pwStatus.msg}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {pwLoading ? "Updating..." : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  Log out
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
