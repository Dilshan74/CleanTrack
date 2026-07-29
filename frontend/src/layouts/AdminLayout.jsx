import {
  BarChart3,
  Bell,
  Brain,
  FileBarChart,
  LayoutDashboard,
  MapPinned,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/phis", label: "Manage PHIs", icon: UserCog },
  { to: "/admin/areas", label: "Manage Areas", icon: MapPinned },
  { to: "/admin/statistics", label: "Statistics", icon: BarChart3 },
  { to: "/admin/ai-accuracy", label: "AI Accuracy", icon: Brain },
  { to: "/admin/monthly-reports", label: "Monthly Reports", icon: FileBarChart },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  return (
    <DashboardLayout
      role="admin"
      items={items}
      title="Admin Console"
      subtitle="System-wide oversight & analytics"
    />
  );
}
