// src/utils/authHandler.js
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../apiConfig";

// Constants for cookie names
const MSAL_TOKEN_COOKIE = "msalAccessToken";
const JWT_TOKEN_COOKIE = "jwtToken";
const USER_INFO_COOKIE = "userInfo";

export const verifyTokenWithBackend = async (msalAccessToken) => {
  try {
    // First store the MSAL token
    storeMsalToken(msalAccessToken);

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
    console.log(data);

    if (!data.IsSuccess) {
      throw new Error(
        data.ErrorDetail || data.Message || "Token verification failed"
      );
    }

    // Store JWT token and user info
    storeJwtToken(data.JwtToken);
    storeUserInfo({
      userId: data.UserId,
      fullName: data.FullName,
      email: data.Email,
      phoneNumber: data.PhoneNumber,
      roleIds: data.RoleIds,
    });

    return data;
  } catch (error) {
    console.error("Token verification error:", error);
    handleTokenExpiration();
    throw error;
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
          sameSite: "strict",
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
          sameSite: "strict",
        });

        startExpirationTimer(expiresAt);
      }
    }
  } catch (error) {
    console.error("Error storing JWT token:", error);
  }
};
const USER_ID_COOKIE = "userId";

const storeUserInfo = (userInfo) => {
  if (!userInfo) return;

  try {
    Cookies.set(USER_INFO_COOKIE, JSON.stringify(userInfo), {
      secure: true,
      sameSite: "strict",
    });

    // userId ayrıca saxlanır
    Cookies.set(USER_ID_COOKIE, userInfo.userId, {
      secure: true,
      sameSite: "strict",
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
  }
};

export const handleTokenExpiration = () => {
  clearAuthTokens();
  window.location.href = "/login";
};

export const clearAuthTokens = () => {
  Cookies.remove(MSAL_TOKEN_COOKIE);
  Cookies.remove(JWT_TOKEN_COOKIE);
  Cookies.remove(USER_INFO_COOKIE);
  Cookies.remove(USER_ID_COOKIE);
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

  return userInfoStr ? JSON.parse(userInfoStr) : null;
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
    return true;
  } catch (error) {
    console.error("Error checking authentication:", error);
    handleTokenExpiration();
    return false;
  }
};
