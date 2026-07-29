import { Route } from "react-router-dom";
import CitizenLayout from "../layouts/CitizenLayout";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/constants";
import Dashboard from "../pages/citizen/Dashboard/Dashboard";
import UploadImage from "../pages/citizen/UploadImage/UploadImage";
import AIResult from "../pages/citizen/AIResult/AIResult";
import TrackComplaint from "../pages/citizen/TrackComplaint/TrackComplaint";
import ComplaintDetails from "../pages/citizen/TrackComplaint/ComplaintDetails";
import DengueRiskMap from "../pages/citizen/DengueRiskMap/DengueRiskMap";
import Notifications from "../pages/citizen/Notifications/Notifications";
import Profile from "../pages/citizen/Profile/Profile";
import EditProfile from "../pages/citizen/Profile/EditProfile";
import Settings from "../pages/citizen/Settings/Settings";

/** Citizen route group, spread into <Routes> by AppRoutes. */
export const citizenRoutes = (
  <Route element={<ProtectedRoute allow={[ROLES.CITIZEN]} />}>
    <Route path="/citizen" element={<CitizenLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="upload" element={<UploadImage />} />
      <Route path="ai-result" element={<AIResult />} />
      <Route path="track" element={<TrackComplaint />} />
      <Route path="track/:id" element={<ComplaintDetails />} />
      <Route path="map" element={<DengueRiskMap />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} />
      <Route path="profile/edit" element={<EditProfile />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>
);

export default citizenRoutes;
