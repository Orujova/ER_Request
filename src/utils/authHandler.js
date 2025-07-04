import Cookies from "js-cookie";
import { API_BASE_URL } from "../../apiConfig";

// Constants for cookie names
const MSAL_TOKEN_COOKIE = "msalAccessToken";
const JWT_TOKEN_COOKIE = "jwtToken";
const USER_INFO_COOKIE = "userInfo";
const USER_ID_COOKIE = "userId";
const AUTH_STATE_COOKIE = "authState";

// Key for storing verified tokens and lock state in localStorage
const VERIFIED_TOKENS_KEY = "verifiedTokens";
const VERIFICATION_LOCK_KEY = "verificationLock";

// Load verified tokens from localStorage on module load
const loadVerifiedTokens = () => {
  const stored = localStorage.getItem(VERIFIED_TOKENS_KEY);
  return stored ? new Set(JSON.parse(stored)) : new Set();
};

// Save verified tokens to localStorage
const saveVerifiedTokens = (tokensSet) => {
  localStorage.setItem(VERIFIED_TOKENS_KEY, JSON.stringify(Array.from(tokensSet)));
};

// Load verification lock state
const loadVerificationLock = () => localStorage.getItem(VERIFICATION_LOCK_KEY);
const saveVerificationLock = (token) => localStorage.setItem(VERIFICATION_LOCK_KEY, token);
const clearVerificationLock = () => localStorage.removeItem(VERIFICATION_LOCK_KEY);

// Initialize verifiedTokens set with persisted data
const verifiedTokens = loadVerifiedTokens();

export const verifyTokenWithBackend = async (msalAccessToken) => {
  // Check if a verification is already in progress for this token
  const currentLock = loadVerificationLock();
  if (currentLock && currentLock !== msalAccessToken) {
    console.log("Verification already in progress for another token, waiting:", currentLock);
    await new Promise((resolve) => setTimeout(resolve, 100)); // Kısa bir bekleme
    return verifyTokenWithBackend(msalAccessToken); // Yeniden kontrol et
  }

  if (verifiedTokens.has(msalAccessToken)) {
    console.log("Token already verified, skipping redundant call:", msalAccessToken);
    const cachedData = getStoredTokens();
    if (cachedData.msalToken && cachedData.jwtToken) {
      return { IsSuccess: true, ...cachedData };
    }
  }

  // Lock the verification process
  saveVerificationLock(msalAccessToken);
  console.log("Starting token verification for:", msalAccessToken);

  try {
    const tokenParts = msalAccessToken.split(".");
    if (tokenParts.length !== 3) throw new Error("Invalid token format");
    const payload = JSON.parse(atob(tokenParts[1]));
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      console.log("Token is expired, clearing auth data:", msalAccessToken);
      handleTokenExpiration();
      throw new Error("Token is expired");
    }

    storeMsalToken(msalAccessToken);
    localStorage.setItem("access_token", msalAccessToken);

    const response = await fetch(
      `${API_BASE_URL}/api/AdminApplicationUser/verify-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Token: msalAccessToken }),
      }
    );

    if (!response.ok) throw new Error(`Token verification failed with status ${response.status}`);
    const data = await response.json();
    if (!data.IsSuccess) throw new Error(data.ErrorDetail || data.Message || "Token verification failed");

    localStorage.setItem("email", data.Email || "");
    localStorage.setItem("rols", JSON.stringify(data.RoleIds || []));
    storeJwtToken(data.JwtToken);
    localStorage.setItem("jwt", data.JwtToken);
    storeUserInfo({
      userId: data.UserId || null,
      fullName: data.FullName || "",
      email: data.Email || "",
      phoneNumber: data.PhoneNumber || "",
      roleIds: data.RoleIds || [],
    });

    setAuthState(true);
    verifiedTokens.add(msalAccessToken);
    saveVerifiedTokens(verifiedTokens);
    console.log("Token verification successful for:", msalAccessToken);

    return data;
  } catch (error) {
    console.error("Token verification error:", error);
    handleTokenExpiration();
    throw error;
  } finally {
    // Clear the lock after verification (success or failure)
    if (loadVerificationLock() === msalAccessToken) clearVerificationLock();
  }
};

// Check if the user should be considered authenticated
export const checkInitialAuthState = () => {
  const authState = getAuthState();
  if (authState !== true) return false;

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

    const roles = localStorage.getItem("rols");
    if (!roles) return false;

    return true;
  } catch (error) {
    console.error("Error checking initial auth state:", error);
    return false;
  }
};

// Ensure all auth data is loaded and available
export const ensureAuthData = async () => {
  try {
    const { msalToken, jwtToken } = getStoredTokens();
    const userInfo = getUserInfo();
    const roles = localStorage.getItem("rols");

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
    Cookies.set(AUTH_STATE_COOKIE, isAuthenticated.toString(), {
      expires: 1,
      secure: true,
      sameSite: "lax",
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
          sameSite: "lax",
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
          sameSite: "lax",
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
      sameSite: "lax",
    });
    Cookies.set(USER_ID_COOKIE, userInfo.userId, {
      secure: true,
      sameSite: "lax",
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
    handleTokenExpiration();
  }
};

export const handleTokenExpiration = () => {
  clearAuthTokens();
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
  verifiedTokens.clear();
  saveVerifiedTokens(verifiedTokens);
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

    const roles = localStorage.getItem("rols");
    const userInfo = getUserInfo();
    if (!roles || !userInfo) {
      console.warn("Missing authentication data");
      return false;
    }

    setAuthState(true);
    return true;
  } catch (error) {
    console.error("Error checking authentication:", error);
    handleTokenExpiration();
    return false;
  }
};

export const checkAndRefreshTokens = async () => {
  try {
    const { msalToken, jwtToken } = getStoredTokens();
    if (!msalToken || !jwtToken) return false;

    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    for (const token of [msalToken, jwtToken]) {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 <= fiveMinutesFromNow) {
          console.log("Token expiring soon, attempting refresh");
          await verifyTokenWithBackend(msalToken);
          return true;
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking/refreshing tokens:", error);
    return false;
  }
};