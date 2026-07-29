import { Link, NavLink } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";
import { cn } from "../../utils/helpers";
import Badge from "../common/Badge";
import { APP_NAME } from "../../utils/constants";
import useAuth from "../../hooks/useAuth";

const ROLE_META = {
  citizen: { title: "Citizen Portal", accent: "from-primary/20 to-accent/10" },
  phi: { title: "PHI Console", accent: "from-accent/20 to-primary/10" },
  admin: { title: "Administrator", accent: "from-primary/25 to-accent/15" },
};

/**
 * Role-aware navigation rail. `items: [{ to, label, icon, badge?, end? }]`
 */
export default function Sidebar({ role, items, collapsed = false, onNavigate }) {
  const meta = ROLE_META[role];
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex items-center gap-3 border-b border-sidebar-border p-4",
          collapsed && "justify-center px-2",
        )}
      >
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br shadow-sm",
            meta.accent,
          )}
        >
          <Shield className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{APP_NAME}</div>
            <div className="truncate text-xs text-muted-foreground">{meta.title}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
                {!collapsed && badge != null && (
                  <Badge className="h-5 px-2 text-[10px]">{badge}</Badge>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={cn("border-t border-sidebar-border p-3", collapsed && "px-2")}>
        <Link
          to="/login"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
}
