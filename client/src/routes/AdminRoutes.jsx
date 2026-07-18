import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageDrivers from "../pages/admin/ManageDrivers";
import ManageTrucks from "../pages/admin/ManageTrucks";
import ManageRoutes from "../pages/admin/ManageRoutes";
import ManageCollections from "../pages/admin/ManageCollections";
import Reports from "../pages/admin/Reports";
import Notifications from "../pages/admin/Notifications";

/** Admin routes, mounted under /admin/* by AppRoutes. */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="drivers" element={<ManageDrivers />} />
        <Route path="trucks" element={<ManageTrucks />} />
        <Route path="routes" element={<ManageRoutes />} />
        <Route path="collections" element={<ManageCollections />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
