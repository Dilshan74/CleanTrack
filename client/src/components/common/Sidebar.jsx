import { NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut } from "lucide-react";
import { APP_NAME } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/helpers";

/**
 * Generic dark dashboard sidebar. Role sidebars (UserSidebar, DriverSidebar,
 * AdminSidebar) wrap this with their own nav config.
 *
 * nav: [{ to, label, icon, end }]
 */
export default function Sidebar({ subtitle = "Dashboard", nav = [] }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Leaf className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <div className="font-bold">{APP_NAME}</div>
          <div className="text-xs text-sidebar-foreground/60">{subtitle}</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )
              }
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
