// src/utils/authService.js
import {
  msalConfig,
  loginRequest,
  graphConfig,
  apiConfig,
} from "../../authConfig";

/**
 * Attaches a given access token to a Microsoft Graph API call
 * @param accessToken - Bearer access token
 */
export async function callMsGraph(accessToken) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(graphConfig.graphMeEndpoint, options)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error calling MS Graph API:", error);
      throw error;
    });
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
