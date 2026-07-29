import {
  Bell,
  Camera,
  FileBarChart,
  FileSearch,
  LayoutDashboard,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const items = [
  { to: "/phi", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/phi/reports", label: "View Reports", icon: FileSearch, badge: 12 },
  { to: "/phi/prediction", label: "AI Prediction", icon: Sparkles },
  { to: "/phi/visits", label: "Visit Locations", icon: MapPin, badge: 4 },
  { to: "/phi/photos", label: "Inspection Photos", icon: Camera },
  { to: "/phi/generate", label: "Generate Reports", icon: FileBarChart },
  { to: "/phi/notifications", label: "Notifications", icon: Bell, badge: 3 },
  { to: "/phi/profile", label: "Profile", icon: User },
];

export default function PHILayout() {
  return (
    <DashboardLayout
      role="phi"
      items={items}
      title="PHI Console"
      subtitle="Verify. Inspect. Escalate."
    />
  );
}
