import {
  LayoutDashboard,
  Users,
  Truck,
  Container,
  Route as RouteIcon,
  ClipboardList,
  BarChart3,
  Bell,
} from "lucide-react";
import Sidebar from "../common/Sidebar";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/drivers", label: "Manage Drivers", icon: Truck },
  { to: "/admin/trucks", label: "Manage Trucks", icon: Container },
  { to: "/admin/routes", label: "Manage Routes", icon: RouteIcon },
  { to: "/admin/collections", label: "Manage Collections", icon: ClipboardList },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
];

export default function AdminSidebar() {
  return <Sidebar subtitle="Admin Console" nav={adminNav} />;
}
