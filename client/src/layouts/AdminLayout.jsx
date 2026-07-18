import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import Navbar from "../components/common/Navbar";
import adminService from "../services/adminService";

export default function AdminLayout() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    adminService.getNotifications().then((n) => {
      if (active) setCount(n.filter((x) => x.unread).length);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          role="Admin"
          title="Admin Console"
          notificationsTo="/admin/notifications"
          count={count}
        />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
