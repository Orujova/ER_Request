// src/components/common/AuthGuard.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { isAuthenticated as isJwtAuthenticated } from "../../utils/authHandler";

export const AuthGuard = ({ children }) => {
  const location = useLocation();
  const isMsalAuthenticated = useIsAuthenticated();

  // Check both MSAL and JWT authentication
  if (!isMsalAuthenticated || !isJwtAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard;
