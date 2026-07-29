import {
  Bell,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  Settings,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const items = [
  { to: "/citizen", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/citizen/upload", label: "Upload Image", icon: Upload },
  { to: "/citizen/ai-result", label: "AI Result", icon: Sparkles },
  { to: "/citizen/track", label: "Track Complaint", icon: ListChecks, badge: 3 },
  { to: "/citizen/map", label: "Dengue Risk Map", icon: MapPinned },
  { to: "/citizen/notifications", label: "Notifications", icon: Bell, badge: 5 },
  { to: "/citizen/profile", label: "Profile", icon: User },
  { to: "/citizen/settings", label: "Settings", icon: Settings },
];

export default function CitizenLayout() {
  return (
    <DashboardLayout
      role="citizen"
      items={items}
      title="Citizen Portal"
      subtitle="Report. Track. Protect your neighbourhood."
    />
  );
}
