import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, AlertCircle, Users, Truck, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { APP_NAME, ROLE_HOME } from "../../utils/constants";
import { validateLogin, hasErrors } from "../../utils/helpers";

const PORTALS = [
  {
    key: "user",
    label: "Resident",
    icon: Users,
    title: "Resident Portal",
    subtitle: "Track pickups, report issues & view your schedule.",
    accent: "bg-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "border-emerald-600 text-emerald-700 bg-emerald-50",
    inactive: "border-transparent text-muted-foreground hover:bg-secondary",
  },
  {
    key: "driver",
    label: "Driver",
    icon: Truck,
    title: "Driver Portal",
    subtitle: "View your route, update stops & manage collections.",
    accent: "bg-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    active: "border-blue-600 text-blue-700 bg-blue-50",
    inactive: "border-transparent text-muted-foreground hover:bg-secondary",
  },
  {
    key: "admin",
    label: "Admin",
    icon: ShieldCheck,
    title: "Admin Portal",
    subtitle: "Manage users, drivers, routes & system settings.",
    accent: "bg-violet-600",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    active: "border-violet-600 text-violet-700 bg-violet-50",
    inactive: "border-transparent text-muted-foreground hover:bg-secondary",
  },
];

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [selectedPortal, setSelectedPortal] = useState(location.state?.portal || "user");

  const portal = PORTALS.find((p) => p.key === selectedPortal);
  const PortalIcon = portal.icon;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setServerError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateLogin(form);
    setErrors(validation);
    if (hasErrors(validation)) return;

    try {
      const user = await login(form);

      // Enforce portal access:
      // Admin and Driver portals are restricted — only the correct role may enter.
      // The Resident tab is open to any authenticated user (redirects to their portal).
      if (selectedPortal === "user" && user.role !== "user") {
        setServerError(
          "Access denied. This portal is for residents only."
        );
        return;
      }
      if (selectedPortal === "admin" && user.role !== "admin") {
        setServerError(
          "Access denied. This portal is for administrators only."
        );
        return;
      }
      if (selectedPortal === "driver" && user.role !== "driver") {
        setServerError(
          "Access denied. This portal is for registered drivers only."
        );
        return;
      }

      const intended = location.state?.from?.pathname;
      navigate(intended || ROLE_HOME[user.role] || "/", { replace: true });
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Invalid email or password. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary to-background p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">

          {/* Portal selector tabs — top of card */}
          <div className="flex border-b">
            {PORTALS.map((p) => {
              const Icon = p.icon;
              const isActive = p.key === selectedPortal;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => { setSelectedPortal(p.key); setServerError(""); }}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium border-b-2 transition-all ${
                    isActive ? p.active : p.inactive
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Portal label badge */}
          <div className="px-8 pt-6 pb-0">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${portal.badge}`}>
              <PortalIcon className="h-3 w-3" />
              {portal.title}
            </span>
          </div>

          {/* Form body */}
          <div className="p-8 pt-4">
            <h1 className="text-2xl font-bold mt-2">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">{portal.subtitle}</p>

            {serverError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm">
                <span className="text-muted-foreground">Email</span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent py-2 outline-none"
                  />
                </div>
                {errors.email && <span className="mt-1 block text-xs text-destructive">{errors.email}</span>}
              </label>

              <label className="block text-sm">
                <span className="text-muted-foreground">Password</span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent py-2 outline-none"
                  />
                </div>
                {errors.password && <span className="mt-1 block text-xs text-destructive">{errors.password}</span>}
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity ${portal.accent}`}
              >
                {loading ? "Signing in…" : `Sign in to ${portal.title}`}
              </button>
            </form>
          </div>
        </div>

        {selectedPortal === "user" && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary font-medium">
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
