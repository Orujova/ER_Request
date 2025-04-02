// src/services/disciplinaryService.js
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens } from "../utils/authHandler";
import { showToast } from "../toast/toast";

// Get request headers with authentication
const getRequestHeaders = () => {
  const { jwtToken } = getStoredTokens();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwtToken}`,
  };
};

// Helper for handling API responses
const handleApiResponse = async (response, errorMessage) => {
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return await response.json();
};

// Helper for error handling with toasts
const handleApiError = (error, setError) => {
  const errorMessage = error.message || "An error occurred";
  showToast(errorMessage, "error");
  if (setError) setError(errorMessage);
};

// API: Fetch all disciplinary actions
export const fetchDisciplinaryActions = async (setLoading, setError) => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/GetAllDisciplinaryAction`, {
      headers: getRequestHeaders(),
    });
    const data = await handleApiResponse(
      response,
      "Failed to fetch disciplinary actions"
    );
    return data[0]?.DisciplinaryActions || [];
  } catch (err) {
    handleApiError(err, setError);
    return [];
  } finally {
    setLoading(false);
  }
};

// API: Fetch all disciplinary results
export const fetchDisciplinaryResults = async (setLoading, setError) => {
  setLoading(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/GetAllDisciplinaryActionResult`,
      {
        headers: getRequestHeaders(),
      }
    );
    const data = await handleApiResponse(
      response,
      "Failed to fetch disciplinary results"
    );
    return data[0]?.DisciplinaryActionResults || [];
  } catch (err) {
    handleApiError(err, setError);
    return [];
  } finally {
    setLoading(false);
  }
};

// API: Fetch all disciplinary violations
export const fetchDisciplinaryViolations = async (setLoading, setError) => {
  setLoading(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/GetAllDisciplinaryViolation`,
      {
        headers: getRequestHeaders(),
      }
    );
    const data = await handleApiResponse(
      response,
      "Failed to fetch disciplinary violations"
    );
    return data[0]?.DisciplinaryViolations || [];
  } catch (err) {
    handleApiError(err, setError);
    return [];
  } finally {
    setLoading(false);
  }
};

// API: Create new disciplinary action
export const createDisciplinaryAction = async (
  action,
  setLoading,
  setError,
  setSuccess
) => {
  if (!action.Name.trim()) {
    const errorMessage = "Name cannot be empty";
    showToast(errorMessage, "error");
    if (setError) setError(errorMessage);
    return null;
  }

  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/CreateDisciplinaryAction`, {
      method: "POST",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        Name: action.Name,
        DisciplinaryActionResultId: action.DisciplinaryActionResultId,
      }),
    });
    const createdAction = await handleApiResponse(
      response,
      "Failed to create disciplinary action"
    );

    const successMessage = `Disciplinary action "${action.Name}" created successfully`;
    showToast(successMessage, "success");

    return createdAction;
  } catch (err) {
    handleApiError(err, setError);
    return null;
  } finally {
    setLoading(false);
  }
};

// API: Create new disciplinary result
export const createDisciplinaryResult = async (
  result,
  setLoading,
  setError,
  setSuccess
) => {
  if (!result.Name.trim()) {
    const errorMessage = "Name cannot be empty";
    showToast(errorMessage, "error");
    if (setError) setError(errorMessage);
    return null;
  }

  setLoading(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/CreateDisciplinaryActionResult`,
      {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Name: result.Name,
        }),
      }
    );
    const createdResult = await handleApiResponse(
      response,
      "Failed to create disciplinary result"
    );

    const successMessage = `Disciplinary result "${result.Name}" created successfully`;
    showToast(successMessage, "success");

    return createdResult;
  } catch (err) {
    handleApiError(err, setError);
    return null;
  } finally {
    setLoading(false);
  }
};

// API: Create new disciplinary violation
export const createDisciplinaryViolation = async (
  violation,
  setLoading,
  setError,
  setSuccess
) => {
  if (!violation.Name.trim()) {
    const errorMessage = "Name cannot be empty";
    showToast(errorMessage, "error");
    if (setError) setError(errorMessage);
    return null;
  }

  setLoading(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/CreateDisciplinaryViolation`,
      {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Name: violation.Name,
        }),
      }
    );
    const createdViolation = await handleApiResponse(
      response,
      "Failed to create disciplinary violation"
    );

    const successMessage = `Disciplinary violation "${violation.Name}" created successfully`;
    showToast(successMessage, "success");

    return createdViolation;
  } catch (err) {
    handleApiError(err, setError);
    return null;
  } finally {
    setLoading(false);
  }
};

// API: Update disciplinary action
export const updateDisciplinaryAction = async (
  action,
  setLoading,
  setError,
  setSuccess
) => {
  if (!action.Name.trim()) {
    const errorMessage = "Name cannot be empty";
    showToast(errorMessage, "error");
    if (setError) setError(errorMessage);
    return null;
  }

  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/UpdateDisciplinaryAction`, {
      method: "PUT",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        Id: action.Id,
        Name: action.Name,
        DisciplinaryActionResultId: action.DisciplinaryActionResultId,
      }),
    });
    await handleApiResponse(response, "Failed to update disciplinary action");

    const successMessage = `Disciplinary action "${action.Name}" updated successfully`;
    showToast(successMessage, "success");

    return true;
  } catch (err) {
    handleApiError(err, setError);
    return null;
  } finally {
    setLoading(false);
  }
};

// API: Update disciplinary result
export const updateDisciplinaryResult = async (
  result,
  setLoading,
  setError,
  setSuccess
) => {
  if (!result.Name.trim()) {
    const errorMessage = "Name cannot be empty";
    showToast(errorMessage, "error");
    if (setError) setError(errorMessage);
    return null;
  }

  setLoading(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/UpdateDisciplinaryActionResult`,
      {
        method: "PUT",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: result.Id,
          Name: result.Name,
        }),
      }
    );
    await handleApiResponse(response, "Failed to update disciplinary result");

    const successMessage = `Disciplinary result "${result.Name}" updated successfully`;
    showToast(successMessage, "success");

    return true;
  } catch (err) {
    handleApiError(err, setError);
    return null;
  } finally {
    setLoading(false);
  }
};

// API: Update disciplinary violation
export const updateDisciplinaryViolation = async (
  violation,
  setLoading,
  setError,
  setSuccess
) => {
  if (!violation.Name.trim()) {
    const errorMessage = "Name cannot be empty";
    showToast(errorMessage, "error");
    if (setError) setError(errorMessage);
    return null;
  }

  setLoading(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/UpdateDisciplinaryViolation`,
      {
        method: "PUT",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: violation.Id,
          Name: violation.Name,
        }),
      }
    );
    await handleApiResponse(
      response,
      "Failed to update disciplinary violation"
    );

    const successMessage = `Disciplinary violation "${violation.Name}" updated successfully`;
    showToast(successMessage, "success");

    return true;
  } catch (err) {
    handleApiError(err, setError);
    return null;
  } finally {
    setLoading(false);
  }
};

// API: Delete disciplinary action
export const deleteDisciplinaryAction = async (
  actionId,
  setLoading,
  setError,
  setSuccess
) => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/DeleteDisciplinaryAction`, {
      method: "DELETE",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        Id: actionId,
      }),
    });
    await handleApiResponse(response, "Failed to delete disciplinary action");

    const successMessage = "Disciplinary action deleted successfully";
    showToast(successMessage, "success");

    return true;
  } catch (err) {
    handleApiError(err, setError);
    return false;
  } finally {
    setLoading(false);
  }
};

// API: Delete disciplinary result
export const deleteDisciplinaryResult = async (
  resultId,
  setLoading,
  setError,
  setSuccess
) => {
  setLoading(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/DeleteDisciplinaryActionResult`,
      {
        method: "DELETE",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: resultId,
        }),
      }
    );
    await handleApiResponse(response, "Failed to delete disciplinary result");

    const successMessage = "Disciplinary result deleted successfully";
    showToast(successMessage, "success");

    return true;
  } catch (err) {
    handleApiError(err, setError);
    return false;
  } finally {
    setLoading(false);
  }
};

// API: Delete disciplinary violation
export const deleteDisciplinaryViolation = async (
  violationId,
  setLoading,
  setError,
  setSuccess
) => {
  setLoading(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/DeleteDisciplinaryViolation`,
      {
        method: "DELETE",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: violationId,
        }),
      }
    );
    await handleApiResponse(
      response,
      "Failed to delete disciplinary violation"
    );

    const successMessage = "Disciplinary violation deleted successfully";
    showToast(successMessage, "success");

    return true;
  } catch (err) {
    handleApiError(err, setError);
    return false;
  } finally {
    setLoading(false);
  }
};
