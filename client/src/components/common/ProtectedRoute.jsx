import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_HOME } from "../../utils/constants";

/**
 * Guards routes by authentication and (optionally) role.
 *
 * - Not logged in → redirect to /login
 * - Wrong role trying to access /admin or /driver → redirect to their own portal
 * - Correct role → render the page
 */
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();

  // Not authenticated at all → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Authenticated but wrong role for this portal → redirect to their correct home
  if (role && currentRole !== role) {
    return <Navigate to={ROLE_HOME[currentRole] || "/login"} replace />;
  }

  return children ?? <Outlet />;
}
