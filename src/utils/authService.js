// src/utils/authService.js
import {
  msalConfig,
  loginRequest,
  graphConfig,
  apiConfig,
} from "../../authConfig";

/**
 * Attaches a given access token to a Microsoft Graph API call
 * @param accessToken
 */

let isFetchingGraph = false;
let cachedGraphData = null;
let lastFetchTime = 0;

const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

export async function callMsGraph(accessToken) {
  if (isFetchingGraph) {
    console.log("Graph API request already in progress, waiting...");

    return new Promise((resolve) => {
      const checkCache = setInterval(() => {
        if (!isFetchingGraph && cachedGraphData) {
          clearInterval(checkCache);
          resolve(cachedGraphData);
        }
      }, 100);
    });
  }

  // If we have cached data that's not expired, use it
  const now = Date.now();
  if (cachedGraphData && now - lastFetchTime < CACHE_EXPIRATION_MS) {
    console.log("Using cached Graph data");
    return cachedGraphData;
  }

  // Set flag to prevent parallel requests
  isFetchingGraph = true;

  try {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
    headers.append("Authorization", bearer);

    const options = {
      method: "GET",
      headers: headers,
    };

    const response = await fetch(graphConfig.graphMeEndpoint, options);
    const data = await response.json();

    // Cache the result
    cachedGraphData = data;
    lastFetchTime = Date.now();

    return data;
  } catch (error) {
    console.error("Error calling MS Graph API:", error);
    throw error;
  } finally {
    // Reset the flag when done, regardless of success or failure
    isFetchingGraph = false;
  }
}

/**
 * Call API with authentication token
 * @param {string} accessToken - Access token
 * @param {string} endpoint - API endpoint to call
 */

export async function callApi(accessToken, endpoint = apiConfig.endpoint) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;
  headers.append("Authorization", bearer);
  headers.append("Content-Type", "application/json");

  console.log(endpoint);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoint, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error calling API:", error);
      throw error;
    });
}

/**
 * Call the backend API endpoints
 * @param {string} accessToken
 * @param {string} endpoint - Optional specific endpoint
 */

export async function callBackendApi(
  accessToken,
  endpoint = apiConfig.backendEndpoint
) {
  return callApi(accessToken, endpoint);
}

/**
 * Get authentication parameters for login
 */
export function getLoginParameters() {
  return loginRequest;
}

/**
 * Get MSAL configuration
 */
export function getMsalConfig() {
  return msalConfig;
}
