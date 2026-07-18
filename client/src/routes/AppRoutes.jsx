import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import UserRoutes from "./UserRoutes";
import DriverRoutes from "./DriverRoutes";
import AdminRoutes from "./AdminRoutes";
import { ROLES } from "../utils/constants";

/** Top-level route table: public auth pages + role-guarded portals. */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/user/*"
        element={
          <ProtectedRoute role={ROLES.USER}>
            <UserRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/*"
        element={
          <ProtectedRoute role={ROLES.DRIVER}>
            <DriverRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role={ROLES.ADMIN}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
