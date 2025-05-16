import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import {
  isAuthenticated as isJwtAuthenticated,
  getUserInfo,
  checkInitialAuthState,
} from "../../utils/authHandler";
import {
  canAccessRoute,
  getDefaultRedirect,
  hasRole,
  hasAdminAccess,
} from "../../utils/roles";
import { useEffect, useState } from "react";

export const AuthGuard = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  const isMsalAuthenticated = useIsAuthenticated();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);

      // First, check initial auth state which is based on cookies
      // This prevents unnecessary redirects when opening a new tab
      if (checkInitialAuthState()) {
        setIsAuth(true);
        setIsChecking(false);
        return;
      }

      // If initial check fails, verify with both MSAL and JWT
      const isJwtAuth = isJwtAuthenticated();
      const userInfo = getUserInfo();

      if (isMsalAuthenticated && isJwtAuth && userInfo) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }

      setIsChecking(false);
    };

    // Run immediately and don't use timeout which can cause delay in rendering
    checkAuth();
  }, [isMsalAuthenticated, location.pathname]);

  // Return a loading state while checking
  if (isChecking) {
    return <div className="p-4 flex justify-center">Verifying access...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to={getDefaultRedirect()} replace />;
    }
  }

  // Check if user can access the current route path
  if (!canAccessRoute(location.pathname)) {
    return <Navigate to={getDefaultRedirect()} replace />;
  }

  // User is authenticated and authorized
  return children;
};

// Admin specific guard
export const AdminGuard = ({ children }) => {
  const location = useLocation();
  const isMsalAuthenticated = useIsAuthenticated();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      setIsChecking(true);

      // First check initial auth state
      if (checkInitialAuthState()) {
        setIsAuth(true);

        // Check admin status separately
        const hasAdmin = hasAdminAccess();
        setIsAdmin(hasAdmin);

        setIsChecking(false);
        return;
      }

      // If initial check fails, verify authentication fully
      const isJwtAuth = isJwtAuthenticated();
      const userInfo = getUserInfo();

      if (isMsalAuthenticated && isJwtAuth && userInfo) {
        setIsAuth(true);

        // Check for admin access
        const hasAdmin = hasAdminAccess();
        setIsAdmin(hasAdmin);
      } else {
        setIsAuth(false);
        setIsAdmin(false);
      }

      setIsChecking(false);
    };

    // Run check immediately
    checkAdmin();
  }, [isMsalAuthenticated]);

  // Return a loading state while checking
  if (isChecking) {
    return (
      <div className="p-4 flex justify-center">Verifying admin access...</div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has admin access
  return children;
};

export default AuthGuard;
