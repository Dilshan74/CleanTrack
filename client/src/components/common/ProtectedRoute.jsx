import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_HOME } from "../../utils/constants";

/**
 * Guards routes by authentication and (optionally) role.
 *
 * Usage as a wrapper:
 *   <ProtectedRoute role="user"><UserRoutes /></ProtectedRoute>
 * or as a layout route (renders <Outlet /> when no children are passed).
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={ROLE_HOME[currentRole] || "/login"} replace />;
  }

  return children ?? <Outlet />;
}
