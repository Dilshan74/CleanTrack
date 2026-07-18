import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { APP_NAME, ROLES, ROLE_HOME } from "../../utils/constants";
import { validateRegister, hasErrors } from "../../utils/helpers";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.USER,
  });
  const [errors, setErrors] = useState({});

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validateRegister(form);
    setErrors(validation);
    if (hasErrors(validation)) return;

    const user = await register(form);
    navigate(ROLE_HOME[user.role] || "/", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary to-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join {APP_NAME} to track pickups and report issues.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="text-muted-foreground">Full name</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <User className="h-4 w-4 text-muted-foreground" />
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-transparent py-2 outline-none"
                />
              </div>
              {errors.name && <span className="mt-1 block text-xs text-destructive">{errors.name}</span>}
            </label>

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
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent py-2 outline-none"
                />
              </div>
              {errors.password && <span className="mt-1 block text-xs text-destructive">{errors.password}</span>}
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Register as</span>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={ROLES.USER}>Resident</option>
                <option value={ROLES.DRIVER}>Driver</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
