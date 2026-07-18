import {
  LayoutDashboard,
  CalendarDays,
  MessageSquareWarning,
  Bell,
  User,
  Settings,
} from "lucide-react";
import Sidebar from "../common/Sidebar";

const userNav = [
  { to: "/user", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/user/schedule", label: "Collection Schedule", icon: CalendarDays },
  { to: "/user/report", label: "Report Complaint", icon: MessageSquareWarning },
  { to: "/user/notifications", label: "Notifications", icon: Bell },
  { to: "/user/profile", label: "Profile", icon: User },
  { to: "/user/settings", label: "Settings", icon: Settings },
];

export default function UserSidebar() {
  return <Sidebar subtitle="Resident Portal" nav={userNav} />;
}
