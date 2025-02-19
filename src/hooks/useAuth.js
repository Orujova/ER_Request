// src/hooks/useAuth.js
import { useState, useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { getLoginParameters } from "../utils/authService";

/**
 * Custom hook for authentication and token management
 */
export const useAuth = () => {
  const { instance, accounts } = useMsal();
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Get access token for API calls
   */
  const getAccessToken = useCallback(async () => {
    if (accounts.length === 0) {
      setAuthError("No account logged in");
      return null;
    }

    setIsGettingToken(true);
    setAuthError(null);

    try {
      const request = {
        ...getLoginParameters(),
        account: accounts[0],
      };

      const response = await instance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      // Silent token acquisition failed
      if (error.name === "InteractionRequiredAuthError") {
        try {
          // Fallback to interaction when silent call fails
          const response = await instance.acquireTokenPopup(request);
          return response.accessToken;
        } catch (interactiveError) {
          setAuthError(
            `Interactive authentication failed: ${interactiveError.message}`
          );
          return null;
        }
      } else {
        setAuthError(`Token acquisition failed: ${error.message}`);
        return null;
      }
    } finally {
      setIsGettingToken(false);
    }
  }, [instance, accounts]);

  /**
   * Login user
   */
  const login = useCallback(
    async (method = "redirect") => {
      try {
        if (method === "popup") {
          await instance.loginPopup(getLoginParameters());
        } else {
          await instance.loginRedirect(getLoginParameters());
        }
      } catch (error) {
        setAuthError(`Login failed: ${error.message}`);
      }
    },
    [instance]
  );

  /**
   * Logout user
   */
  const logout = useCallback(
    async (method = "redirect") => {
      try {
        if (method === "popup") {
          await instance.logoutPopup({
            postLogoutRedirectUri: window.location.origin,
          });
        } else {
          await instance.logoutRedirect({
            postLogoutRedirectUri: window.location.origin,
          });
        }
      } catch (error) {
        setAuthError(`Logout failed: ${error.message}`);
      }
    },
    [instance]
  );

  /**
   * Get current user information
   */
  const getCurrentUser = useCallback(() => {
    if (accounts.length === 0) {
      return null;
    }

    const account = accounts[0];
    return {
      username: account.username,
      name: account.name,
      homeAccountId: account.homeAccountId,
      environment: account.environment,
      tenantId: account.tenantId,
    };
  }, [accounts]);

  return {
    getAccessToken,
    login,
    logout,
    getCurrentUser,
    isGettingToken,
    authError,
    setAuthError,
    accounts,
  };
};
