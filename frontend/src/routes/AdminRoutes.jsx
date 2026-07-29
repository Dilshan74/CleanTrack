import { Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/constants";
import Dashboard from "../pages/admin/Dashboard/Dashboard";
import ManageUsers from "../pages/admin/ManageUsers/ManageUsers";
import ManagePHIs from "../pages/admin/ManagePHIs/ManagePHIs";
import ManageAreas from "../pages/admin/ManageAreas/ManageAreas";
import Statistics from "../pages/admin/Statistics/Statistics";
import AIAccuracy from "../pages/admin/AIAccuracy/AIAccuracy";
import MonthlyReports from "../pages/admin/MonthlyReports/MonthlyReports";
import Settings from "../pages/admin/Settings/Settings";

/** Administrator route group. */
export const adminRoutes = (
  <Route element={<ProtectedRoute allow={[ROLES.ADMIN]} />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="phis" element={<ManagePHIs />} />
      <Route path="areas" element={<ManageAreas />} />
      <Route path="statistics" element={<Statistics />} />
      <Route path="ai-accuracy" element={<AIAccuracy />} />
      <Route path="monthly-reports" element={<MonthlyReports />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>
);

export default adminRoutes;
