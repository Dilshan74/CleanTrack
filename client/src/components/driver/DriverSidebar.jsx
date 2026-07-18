import {
  LayoutDashboard,
  ListChecks,
  CircleCheckBig,
  MapPin,
  Bell,
  Settings,
} from "lucide-react";
import Sidebar from "../common/Sidebar";

const driverNav = [
  { to: "/driver", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/driver/schedule", label: "Today's Schedule", icon: ListChecks },
  { to: "/driver/status", label: "Update Status", icon: CircleCheckBig },
  { to: "/driver/location", label: "Live Location", icon: MapPin },
  { to: "/driver/notifications", label: "Notifications", icon: Bell },
  { to: "/driver/settings", label: "Settings", icon: Settings },
];

export default function DriverSidebar() {
  return <Sidebar subtitle="Driver Portal" nav={driverNav} />;
}
