// src/utils/apiClient.js
import { useAuth } from "../hooks/useAuth";

/**
 * Creates an API client with authentication capabilities
 * @returns {Object} API client methods
 */
export const useApiClient = () => {
  const { getAccessToken, authError, setAuthError } = useAuth();

  /**
   * Makes an authenticated request to the API
   * @param {string} url - The API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} - The fetch promise
   */
  const authenticatedRequest = async (url, options = {}) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to obtain access token");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  return {
    // GET request
    get: (url, options = {}) =>
      authenticatedRequest(url, {
        ...options,
        method: "GET",
      }),

    // POST request
    post: (url, data, options = {}) =>
      authenticatedRequest(url, {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      }),

    // PUT request
    put: (url, data, options = {}) =>
      authenticatedRequest(url, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
      }),

    // PATCH request
    patch: (url, data, options = {}) =>
      authenticatedRequest(url, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    // DELETE request
    delete: (url, options = {}) =>
      authenticatedRequest(url, {
        ...options,
        method: "DELETE",
      }),

    // Current auth error
    authError,
  };
};
