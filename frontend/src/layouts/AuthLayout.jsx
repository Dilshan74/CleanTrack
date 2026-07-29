import { Link, Outlet } from "react-router-dom";
import { Shield } from "lucide-react";
import { APP_NAME } from "../utils/constants";

const STATS = [
  ["12k+", "Reports"],
  ["93%", "AI accuracy"],
  ["218", "PHIs"],
];

/** Split-screen shell for login, register and password recovery. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.18),transparent_45%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">{APP_NAME}</span>
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Public health, powered by intelligence.
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Join thousands of citizens and inspectors preventing dengue outbreaks — one
              report at a time.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {STATS.map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-primary-foreground/80">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-primary-foreground/70">© 2026 {APP_NAME}</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">{APP_NAME}</span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
