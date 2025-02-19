// src/hooks/useMsalAuthentication.js
import { useState, useEffect } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

/**
 * Custom hook to manage MSAL authentication state
 * @returns {Object} Authentication state and methods
 */
export const useMsalAuthentication = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Verify authentication state
  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);

      if (isAuthenticated && accounts.length > 0) {
        try {
          // Try to silently get a token to verify authentication
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });

          setUserInfo({
            username: accounts[0].username || accounts[0].name,
            accessToken: response.accessToken,
            account: accounts[0],
          });
        } catch (err) {
          setError(err);
          console.error("Token acquisition failed:", err);
        }
      } else {
        setUserInfo(null);
      }

      setIsLoading(false);
    };

    verifyAuth();
  }, [isAuthenticated, accounts, instance]);

  // Login function
  const login = async (method = "redirect") => {
    try {
      if (method === "popup") {
        await instance.loginPopup(loginRequest);
      } else {
        await instance.loginRedirect(loginRequest);
      }
    } catch (err) {
      setError(err);
      console.error("Login failed:", err);
    }
  };

  // Logout function
  const logout = async (method = "redirect") => {
    try {
      if (method === "popup") {
        await instance.logoutPopup({
          postLogoutRedirectUri: window.location.origin + "/login",
        });
      } else {
        await instance.logoutRedirect({
          postLogoutRedirectUri: window.location.origin + "/login",
        });
      }
    } catch (err) {
      setError(err);
      console.error("Logout failed:", err);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user: userInfo,
    error,
    login,
    logout,
  };
};
