// src/redux/slices/requestFormSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens, getUserId } from "../../utils/authHandler";

// Constants
export const ERRequestType = {
  EmployeeRequest: 0,
  GeneralRequest: 1,
};

// Async thunks
export const fetchDependencies = createAsyncThunk(
  "requestForm/fetchDependencies",
  async (_, { rejectWithValue }) => {
    try {
      const { jwtToken } = getStoredTokens();

      const fetchOptions = {
        headers: {
          "ngrok-skip-browser-warning": "narmin",
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/json",
        },
      };

      const casesResponse = await fetch(
        `${API_BASE_URL}/api/Case`,
        fetchOptions
      );

      if (!casesResponse.ok) {
        console.error("Cases API failed with status:", casesResponse.status);
        throw new Error(`Cases API failed: ${casesResponse.statusText}`);
      }

      const casesData = await casesResponse.json();

      // Safely extract cases data with fallbacks
      let fetchedCases = [];
      if (
        casesData &&
        Array.isArray(casesData) &&
        casesData.length > 0 &&
        casesData[0]?.Cases
      ) {
        fetchedCases = casesData[0].Cases;
      } else if (casesData && Array.isArray(casesData)) {
        fetchedCases = casesData;
      }

      const subCasesResponse = await fetch(
        `${API_BASE_URL}/api/SubCase`,
        fetchOptions
      );

      if (!subCasesResponse.ok) {
        console.error(
          "SubCases API failed with status:",
          subCasesResponse.status
        );
        throw new Error(`SubCases API failed: ${subCasesResponse.statusText}`);
      }

      const subCasesData = await subCasesResponse.json();

      // Safely extract subcases data with fallbacks
      let fetchedSubCases = [];
      if (
        subCasesData &&
        Array.isArray(subCasesData) &&
        subCasesData.length > 0 &&
        subCasesData[0]?.SubCases
      ) {
        fetchedSubCases = subCasesData[0].SubCases;
      } else if (subCasesData && Array.isArray(subCasesData)) {
        fetchedSubCases = subCasesData;
      }

      const employeesResponse = await fetch(
        `${API_BASE_URL}/api/Employee`,
        fetchOptions
      );

      if (!employeesResponse.ok) {
        console.error(
          "Employees API failed with status:",
          employeesResponse.status
        );
        throw new Error(
          `Employees API failed: ${employeesResponse.statusText}`
        );
      }

      const employeesData = await employeesResponse.json();

      // Safely extract employees data with fallbacks
      let fetchedEmployees = [];
      if (
        employeesData &&
        Array.isArray(employeesData) &&
        employeesData.length > 0 &&
        employeesData[0]?.Employees
      ) {
        fetchedEmployees = employeesData[0].Employees;
      } else if (employeesData && Array.isArray(employeesData)) {
        fetchedEmployees = employeesData;
      }

      const projectsResponse = await fetch(
        `${API_BASE_URL}/api/Project`,
        fetchOptions
      );

      if (!projectsResponse.ok) {
        console.error(
          "Projects API failed with status:",
          projectsResponse.status
        );
        throw new Error(`Projects API failed: ${projectsResponse.statusText}`);
      }

      const projectsData = await projectsResponse.json();

      // Safely extract projects data with fallbacks
      let fetchedProjects = [];
      if (
        projectsData &&
        Array.isArray(projectsData) &&
        projectsData.length > 0 &&
        projectsData[0]?.Projects
      ) {
        fetchedProjects = projectsData[0].Projects;
      } else if (projectsData && Array.isArray(projectsData)) {
        fetchedProjects = projectsData;
      }

      const result = {
        cases: fetchedCases,
        subCases: fetchedSubCases,
        employees: fetchedEmployees,
        projects: fetchedProjects,
      };

      return result;
    } catch (error) {
      console.error("Failed to fetch dependencies", error);
      return rejectWithValue(error.message || "Failed to load form data");
    }
  }
);

export const submitRequest = createAsyncThunk(
  "requestForm/submitRequest",
  async (_, { getState, rejectWithValue }) => {
    try {
      const formDataState = getState().formData;
      const { jwtToken, msalToken } = getStoredTokens();
      const userId = getUserId() || "0";
      const formDataObj = new FormData();

      // Add access token
      formDataObj.append("AccessToken", msalToken || "");

      // Add UserId - IMPORTANT: API requires a valid userId
      formDataObj.append("UserId", userId);

      // Get case and subcase info
      const cases = getState().requestForm.cases || [];
      const subCases = getState().requestForm.subCases || [];

      // Trim whitespace from requestType and subCase
      const requestType = formDataState.requestType?.trim();
      const subCase = formDataState.subCase?.trim();

      // Find case and subcase by trimmed values
      const selectedCase = cases.find((c) => c.CaseName.trim() === requestType);
      const selectedSubCase = subCases.find(
        (sc) => sc.Description.trim() === subCase
      );

      formDataObj.append("CaseId", selectedCase?.Id || "0");
      formDataObj.append("SubCaseId", selectedSubCase?.Id || "0");

      // Request type (employee or general)
      const isEmployeeRequest = formDataState.activeTab === "employee";
      formDataObj.append(
        "RequestType",
        isEmployeeRequest ? "0" : "1" // Use string values "0" or "1" instead of numbers
      );

      if (isEmployeeRequest) {
        // Employee request - include employee data
        formDataObj.append(
          "EmployeeId",
          formDataState.selectedEmployee?.Id || "0"
        );
        formDataObj.append(
          "ProjectId",
          formDataState.selectedEmployee?.Project?.Id ||
            formDataState.projectId ||
            "0"
        );
      } else {
        formDataObj.append("EmployeeId", "0");
        formDataObj.append("ProjectId", formDataState.projectId || "0");
      }

      // Common fields for both request types
      formDataObj.append("MailCcAddresses", formDataState.ccAddresses || "");
      formDataObj.append("MailBody", formDataState.mailBody || "");

      // Handle hyperlinks
      if (formDataState.hyperlinks && formDataState.hyperlinks.length > 0) {
        formDataState.hyperlinks.forEach((link, index) => {
          if (link && link.trim()) {
            formDataObj.append(`HyperLinks[${index}]`, link.trim());
          }
        });
      }

      const files = window.submissionFiles || [];

      // Group files by their types
      const actFiles = files.filter((f) => f.type === "act");
      const presentationFiles = files.filter((f) => f.type === "presentation");
      const explanationFiles = files.filter((f) => f.type === "explanation");
      const generalFiles = files.filter((f) => f.type === "other");

      // Add act files to FormData with proper array name
      if (actFiles.length > 0) {
        actFiles.forEach((fileInfo, index) => {
          if (fileInfo.file && fileInfo.file instanceof File) {
            console.log(`Appending act file: ${fileInfo.file.name}`);
            // Use 'ActAttachments' as the field name
            formDataObj.append(`ActAttachments`, fileInfo.file);
          }
        });
      } else {
        // Make sure to send an empty array if no files
        formDataObj.append("ActAttachments", "");
      }

      // Add presentation files to FormData
      if (presentationFiles.length > 0) {
        presentationFiles.forEach((fileInfo, index) => {
          if (fileInfo.file && fileInfo.file instanceof File) {
            console.log(`Appending presentation file: ${fileInfo.file.name}`);
            // Use 'PresentationAttachments' as the field name
            formDataObj.append(`PresentationAttachments`, fileInfo.file);
          }
        });
      } else {
        // Make sure to send an empty array if no files
        formDataObj.append("PresentationAttachments", "");
      }

      // Add explanation files to FormData
      if (explanationFiles.length > 0) {
        explanationFiles.forEach((fileInfo, index) => {
          if (fileInfo.file && fileInfo.file instanceof File) {
            console.log(`Appending explanation file: ${fileInfo.file.name}`);
            // Use 'ExplanationAttachments' as the field name
            formDataObj.append(`ExplanationAttachments`, fileInfo.file);
          }
        });
      } else {
        // Make sure to send an empty array if no files
        formDataObj.append("ExplanationAttachments", "");
      }

      // Add general files to FormData
      if (generalFiles.length > 0) {
        generalFiles.forEach((fileInfo, index) => {
          if (fileInfo.file && fileInfo.file instanceof File) {
            console.log(`Appending general file: ${fileInfo.file.name}`);
            // Use 'GeneralAttachments' as the field name
            formDataObj.append(`GeneralAttachments`, fileInfo.file);
          }
        });
      } else {
        // Make sure to send an empty array if no files
        formDataObj.append("GeneralAttachments", "");
      }

      // Log the formData to make sure everything is added correctly
      for (let pair of formDataObj.entries()) {
        console.log(
          pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1])
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/AddERRequest`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "narmin",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formDataObj,
        }
      );

      // Parse the response
      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Parsed API response:", responseData);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        responseData = { message: responseText };
      }

      if (!response.ok || (responseData && responseData.IsSuccess === false)) {
        throw new Error(
          responseData.Message ||
            (responseData.errors && JSON.stringify(responseData.errors)) ||
            "Submission failed"
        );
      }

      console.log("Form submitted successfully!");
      return responseData;
    } catch (error) {
      console.error("Submission failed:", error);
      return rejectWithValue(error.message || "Submission failed");
    }
  }
);
const requestFormSlice = createSlice({
  name: "requestForm",
  initialState: {
    cases: [],
    subCases: [],
    employees: [],
    projects: [],
    loading: false,
    submitLoading: false,
    error: null,
    submitSuccess: false,
  },
  reducers: {
    resetSubmitStatus: (state) => {
      state.submitLoading = false;
      state.error = null;
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dependencies cases
      .addCase(fetchDependencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDependencies.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we always have arrays even if API returns null/undefined
        state.cases = action.payload.cases || [];
        state.subCases = action.payload.subCases || [];
        state.employees = action.payload.employees || [];
        state.projects = action.payload.projects || [];
      })
      .addCase(fetchDependencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Failed to fetch dependencies:", action.payload);

        // Set default empty arrays to prevent undefined errors
        state.cases = [];
        state.subCases = [];
        state.employees = [];
        state.projects = [];
      })
      // Submit request cases
      .addCase(submitRequest.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        console.log("Submitting request...");
      })
      .addCase(submitRequest.fulfilled, (state) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        console.log("Request submitted successfully!");
      })
      .addCase(submitRequest.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload;
        console.error("Request submission failed:", action.payload);
      });
  },
});

export const { resetSubmitStatus } = requestFormSlice.actions;

export default requestFormSlice.reducer;
