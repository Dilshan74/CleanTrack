import { Route } from "react-router-dom";
import PHILayout from "../layouts/PHILayout";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/constants";
import Dashboard from "../pages/phi/Dashboard/Dashboard";
import ViewReports from "../pages/phi/ViewReports/ViewReports";
import ReportDetails from "../pages/phi/ViewReports/ReportDetails";
import AIPrediction from "../pages/phi/AIPrediction/AIPrediction";
import VisitLocations from "../pages/phi/VisitLocations/VisitLocations";
import InspectionPhotos from "../pages/phi/InspectionPhotos/InspectionPhotos";
import GenerateReports from "../pages/phi/GenerateReports/GenerateReports";
import Notifications from "../pages/phi/Notifications/Notifications";
import Profile from "../pages/phi/Profile/Profile";

/** PHI (Public Health Inspector) route group. */
export const phiRoutes = (
  <Route element={<ProtectedRoute allow={[ROLES.PHI]} />}>
    <Route path="/phi" element={<PHILayout />}>
      <Route index element={<Dashboard />} />
      <Route path="reports" element={<ViewReports />} />
      <Route path="reports/:id" element={<ReportDetails />} />
      <Route path="prediction" element={<AIPrediction />} />
      <Route path="visits" element={<VisitLocations />} />
      <Route path="photos" element={<InspectionPhotos />} />
      <Route path="generate" element={<GenerateReports />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} />
    </Route>
  </Route>
);

export default phiRoutes;
