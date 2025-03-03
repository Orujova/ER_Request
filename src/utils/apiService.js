// src/utils/apiService.js
import { getStoredTokens } from "./authHandler";
import { API_BASE_URL } from "../../apiConfig";

export const apiService = {
  // GET request with auth
  async get(endpoint) {
    try {
      const { jwtToken } = getStoredTokens();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  },

  // POST request with auth
  async post(endpoint, data) {
    try {
      const { jwtToken } = getStoredTokens();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  },

  // PUT request with auth
  async put(endpoint, data) {
    try {
      const { jwtToken } = getStoredTokens();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  },

  // DELETE request with auth
  async delete(endpoint) {
    try {
      const { jwtToken } = getStoredTokens();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  },
};
