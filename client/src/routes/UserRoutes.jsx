import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import UserDashboard from "../pages/user/UserDashboard";
import CollectionSchedule from "../pages/user/CollectionSchedule";
import ReportComplaint from "../pages/user/ReportComplaint";
import Notifications from "../pages/user/Notifications";
import Profile from "../pages/user/Profile";
import Settings from "../pages/user/Settings";

/** Resident routes, mounted under /user/* by AppRoutes. */
export default function UserRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<UserDashboard />} />
        <Route path="schedule" element={<CollectionSchedule />} />
        <Route path="report" element={<ReportComplaint />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Route>
    </Routes>
  );
}
