import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import Navbar from "../components/common/Navbar";
import userService from "../services/userService";

export default function UserLayout() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    userService.getNotifications().then((n) => {
      if (active) setCount(n.filter((x) => x.unread).length);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          role="User"
          title="Resident Portal"
          notificationsTo="/user/notifications"
          count={count}
        />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
