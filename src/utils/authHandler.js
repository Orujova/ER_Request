// src/utils/authHandler.js
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../apiConfig";

// Constants for cookie names
const MSAL_TOKEN_COOKIE = "msalAccessToken";
const JWT_TOKEN_COOKIE = "jwtToken";
const USER_INFO_COOKIE = "userInfo";
const USER_ID_COOKIE = "userId";
const AUTH_STATE_COOKIE = "authState";

export const verifyTokenWithBackend = async (msalAccessToken) => {
  try {
    // First store the MSAL token
    storeMsalToken(msalAccessToken);
    localStorage.setItem("access_token", msalAccessToken);

    const response = await fetch(
      `${API_BASE_URL}/api/AdminApplicationUser/verify-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Token: msalAccessToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Token verification failed");
    }

    const data = await response.json();
    localStorage.setItem("email", data.Email);
    localStorage.setItem("rols", data.RoleIds);

    if (!data.IsSuccess) {
      throw new Error(
        data.ErrorDetail || data.Message || "Token verification failed"
      );
    }

    // Store JWT token and user info
    storeJwtToken(data.JwtToken);

    localStorage.setItem("jwt", data.JwtToken);
    storeUserInfo({
      userId: data.UserId,
      fullName: data.FullName,
      email: data.Email,
      phoneNumber: data.PhoneNumber,
      roleIds: data.RoleIds,
    });

    // Set auth state to true and store it
    setAuthState(true);

    return data;
  } catch (error) {
    console.error("Token verification error:", error);
    handleTokenExpiration();
    throw error;
  }
};

// Check if the user should be considered authenticated
export const checkInitialAuthState = () => {
  // Check if auth state is explicitly set
  const authState = getAuthState();
  if (authState === true) {
    // Double-check tokens actually exist
    const tokens = getStoredTokens();
    if (tokens.msalToken && tokens.jwtToken) {
      try {
        // Verify tokens are valid
        for (const token of [tokens.msalToken, tokens.jwtToken]) {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp * 1000 <= Date.now()) {
              // Token is expired
              handleTokenExpiration();
              return false;
            }
          }
        }

        // Make sure we have role information as well
        const roles = localStorage.getItem("rols");
        if (!roles) {
          console.warn("Missing role information");
          return false;
        }

        // All checks passed
        return true;
      } catch (error) {
        console.error("Error checking initial auth state:", error);
      }
    }
  }
  return false;
};

// Add a new function to ensure all auth data is loaded and available
export const ensureAuthData = async () => {
  try {
    // Check if we have all required auth data
    const { msalToken, jwtToken } = getStoredTokens();
    const userInfo = getUserInfo();
    const roles = localStorage.getItem("rols");

    // If we're missing any critical auth data but have tokens, reload them
    if (msalToken && (!userInfo || !roles || !jwtToken)) {
      console.log("Reloading auth data from backend");
      await verifyTokenWithBackend(msalToken);
      return true;
    }

    return msalToken && jwtToken && userInfo && roles;
  } catch (error) {
    console.error("Error ensuring auth data:", error);
    return false;
  }
};

const setAuthState = (isAuthenticated) => {
  try {
    // Store auth state with 1 day expiration
    Cookies.set(AUTH_STATE_COOKIE, isAuthenticated.toString(), {
      expires: 1, // 1 day
      secure: true,
      sameSite: "lax", // Allow cross-tab access
    });
  } catch (error) {
    console.error("Error setting auth state:", error);
  }
};

const getAuthState = () => {
  try {
    const state = Cookies.get(AUTH_STATE_COOKIE);
    return state === "true";
  } catch (error) {
    console.error("Error getting auth state:", error);
    return false;
  }
};

const storeMsalToken = (msalToken) => {
  if (!msalToken) return;

  try {
    const tokenParts = msalToken.split(".");
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.exp) {
        const expiresAt = new Date(payload.exp * 1000);

        Cookies.set(MSAL_TOKEN_COOKIE, msalToken, {
          expires: expiresAt,
          secure: true,
          sameSite: "lax", // Changed from strict to lax to allow cross-tab access
        });

        startExpirationTimer(expiresAt);
      }
    }
  } catch (error) {
    console.error("Error storing MSAL token:", error);
  }
};

const storeJwtToken = (jwtToken) => {
  if (!jwtToken) return;

  try {
    const tokenParts = jwtToken.split(".");
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      if (payload.exp) {
        const expiresAt = new Date(payload.exp * 1000);

        Cookies.set(JWT_TOKEN_COOKIE, jwtToken, {
          expires: expiresAt,
          secure: true,
          sameSite: "lax", // Changed from strict to lax to allow cross-tab access
        });

        startExpirationTimer(expiresAt);
      }
    }
  } catch (error) {
    console.error("Error storing JWT token:", error);
  }
};

const storeUserInfo = (userInfo) => {
  if (!userInfo) return;

  try {
    Cookies.set(USER_INFO_COOKIE, JSON.stringify(userInfo), {
      secure: true,
      sameSite: "lax", // Changed from strict to lax to allow cross-tab access
    });

    // userId ayrıca saxlanır
    Cookies.set(USER_ID_COOKIE, userInfo.userId, {
      secure: true,
      sameSite: "lax", // Changed from strict to lax to allow cross-tab access
    });
  } catch (error) {
    console.error("Error storing user info:", error);
  }
};

export const getUserId = () => {
  return Cookies.get(USER_ID_COOKIE) || null;
};

let expirationTimer;
const startExpirationTimer = (expiresAt) => {
  clearTimeout(expirationTimer);

  const timeUntilExpiry = expiresAt.getTime() - Date.now();
  if (timeUntilExpiry > 0) {
    expirationTimer = setTimeout(handleTokenExpiration, timeUntilExpiry);
  } else {
    // If token is already expired, handle expiration immediately
    handleTokenExpiration();
  }
};

export const handleTokenExpiration = () => {
  clearAuthTokens();
  // Only redirect if we're not already on the login page
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export const clearAuthTokens = () => {
  Cookies.remove(MSAL_TOKEN_COOKIE);
  Cookies.remove(JWT_TOKEN_COOKIE);
  Cookies.remove(USER_INFO_COOKIE);
  Cookies.remove(USER_ID_COOKIE);
  Cookies.remove(AUTH_STATE_COOKIE);
  localStorage.removeItem("access_token");
  localStorage.removeItem("email");
  localStorage.removeItem("rols");
  localStorage.removeItem("jwt");
  clearTimeout(expirationTimer);
};

export const getStoredTokens = () => {
  return {
    msalToken: Cookies.get(MSAL_TOKEN_COOKIE),
    jwtToken: Cookies.get(JWT_TOKEN_COOKIE),
  };
};

export const getUserInfo = () => {
  const userInfoStr = Cookies.get(USER_INFO_COOKIE);
  if (!userInfoStr) return null;

  try {
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error("Error parsing user info:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  const tokens = getStoredTokens();
  if (!tokens.msalToken || !tokens.jwtToken) return false;

  try {
    for (const token of [tokens.msalToken, tokens.jwtToken]) {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 <= Date.now()) {
          handleTokenExpiration();
          return false;
        }
      }
    }

    // Check additional required auth data
    const roles = localStorage.getItem("rols");
    const userInfo = getUserInfo();
    if (!roles || !userInfo) {
      console.warn("Missing authentication data");
      return false;
    }

    // Explicitly set auth state to true whenever checked and valid
    setAuthState(true);
    return true;
  } catch (error) {
    console.error("Error checking authentication:", error);
    handleTokenExpiration();
    return false;
  }
};

// Add a function to check if the refresh token needs to be used
export const checkAndRefreshTokens = async () => {
  try {
    const { msalToken, jwtToken } = getStoredTokens();
    if (!msalToken || !jwtToken) return false;

    // Check if tokens will expire soon (within 5 minutes)
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

    for (const token of [msalToken, jwtToken]) {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 <= fiveMinutesFromNow) {
          // Token will expire soon, try to refresh
          console.log("Token expiring soon, attempting refresh");

          // This assumes your MSAL configuration handles refresh tokens automatically
          // You may need to call your backend to refresh the JWT token as well
          await verifyTokenWithBackend(msalToken);
          return true;
        }
      }
    }

    return true; // Tokens are valid and not expiring soon
  } catch (error) {
    console.error("Error checking/refreshing tokens:", error);
    return false;
  }
};
