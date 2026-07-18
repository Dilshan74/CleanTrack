import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DriverSidebar from "../components/driver/DriverSidebar";
import Navbar from "../components/common/Navbar";
import driverService from "../services/driverService";

export default function DriverLayout() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    driverService.getNotifications().then((n) => {
      if (active) setCount(n.filter((x) => x.unread).length);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <DriverSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          role="Driver"
          title="Driver Portal"
          notificationsTo="/driver/notifications"
          count={count}
        />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
