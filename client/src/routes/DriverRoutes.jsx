import { Routes, Route, Navigate } from "react-router-dom";
import DriverLayout from "../layouts/DriverLayout";
import DriverDashboard from "../pages/driver/DriverDashboard";
import TodaysSchedule from "../pages/driver/TodaysSchedule";
import UpdateCollectionStatus from "../pages/driver/UpdateCollectionStatus";
import LiveLocation from "../pages/driver/LiveLocation";
import Notifications from "../pages/driver/Notifications";
import Settings from "../pages/driver/Settings";

/** Driver routes, mounted under /driver/* by AppRoutes. */
export default function DriverRoutes() {
  return (
    <Routes>
      <Route element={<DriverLayout />}>
        <Route index element={<DriverDashboard />} />
        <Route path="schedule" element={<TodaysSchedule />} />
        <Route path="status" element={<UpdateCollectionStatus />} />
        <Route path="location" element={<LiveLocation />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/driver" replace />} />
      </Route>
    </Routes>
  );
}
