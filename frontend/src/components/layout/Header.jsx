import { Link } from "react-router-dom";
import { Bell, ChevronsLeft, ChevronsRight, Menu, Moon, Sun } from "lucide-react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import SearchBar from "../common/SearchBar";
import useTheme from "../../hooks/useTheme";
import useNotification from "../../hooks/useNotification";

/** Dashboard top bar: sidebar toggles, search, theme, notifications, avatar. */
export default function Header({
  title,
  subtitle,
  role,
  collapsed,
  onToggleCollapse,
  onOpenMobileNav,
}) {
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();
  const roleLabel = role === "phi" ? "PHI" : role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-lg md:px-6">
      <Button
        size="icon"
        variant="ghost"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={onOpenMobileNav}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="hidden md:inline-flex"
        aria-label="Toggle sidebar"
        onClick={onToggleCollapse}
      >
        {collapsed ? (
          <ChevronsRight className="h-5 w-5" />
        ) : (
          <ChevronsLeft className="h-5 w-5" />
        )}
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <SearchBar
        placeholder="Search reports, areas…"
        className="hidden w-72 lg:block"
        inputClassName="h-9"
      />

      <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <Button
        as={Link}
        to={`/${role}/notifications`}
        size="icon"
        variant="ghost"
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </Button>
      <Avatar name={roleLabel} className="h-9 w-9" />
    </header>
  );
}
