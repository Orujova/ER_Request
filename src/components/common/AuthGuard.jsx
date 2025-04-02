import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { isAuthenticated as isJwtAuthenticated } from "../../utils/authHandler";
import {
  ROLES,
  canAccessRoute,
  getDefaultRedirect,
  hasRole,
  hasAdminAccess,
} from "../../utils/roles";

export const AuthGuard = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  const isMsalAuthenticated = useIsAuthenticated();

  // Check both MSAL and JWT authentication
  if (!isMsalAuthenticated || !isJwtAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required for this route, check those
  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some((role) => hasRole(role))
  ) {
    return <Navigate to={getDefaultRedirect()} replace />;
  }

  // Check if user can access the current route based on their roleAs
  if (!canAccessRoute(location.pathname)) {
    return <Navigate to={getDefaultRedirect()} replace />;
  }

  // User is authenticated and authorized to access the route
  return children;
};

// Admin specific guard
export const AdminGuard = ({ children }) => {
  const location = useLocation();
  const isMsalAuthenticated = useIsAuthenticated();
  const isJwtAuth = isJwtAuthenticated();

  // Check authentication
  if (!isMsalAuthenticated || !isJwtAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only admin (3) and ER admin (14) can access
  if (!hasAdminAccess()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthGuard;
