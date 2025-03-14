// src/redux/slices/formDataSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { submitRequest } from "./requestFormSlice";

const initialState = {
  // Tab state
  activeTab: "employee",

  // Case data
  requestType: "",
  subCase: "",

  // Employee and project data
  selectedEmployee: null,
  projectId: null,

  // Mail data
  ccAddresses: "",
  mailBody: "",
  selectedCCUsers: [],

  // Hyperlinks - ensure it's an array with at least one empty string
  hyperlinks: [""],

  // File attachments by category - ensure these are arrays
  actFiles: [],
  presentationFiles: [],
  explanationFiles: [],
  otherFiles: [],

  // Search queries
  searchQueries: {
    case: "",
    subCase: "",
    badge: "",
    name: "",
    project: "",
  },
};

const formDataSlice = createSlice({
  name: "formData",
  initialState,
  reducers: {
    // Tab actions
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      console.log(`Active tab changed to: ${action.payload}`);

      // Reset project when switching tabs
      if (
        action.payload === "employee" &&
        state.selectedEmployee?.Project?.Id
      ) {
        state.projectId = state.selectedEmployee.Project.Id;
      } else if (action.payload === "general") {
        state.projectId = null;
      }
    },

    // Case/subcase actions
    setRequestType: (state, action) => {
      state.requestType = action.payload;
      state.subCase = ""; // Reset subcase when case changes
      console.log(`Request type set to: ${action.payload}`);
    },
    setSubCase: (state, action) => {
      state.subCase = action.payload;
      console.log(`Sub case set to: ${action.payload}`);
    },

    // Employee actions
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
      console.log(`Selected employee: ${action.payload?.FullName || "None"}`);

      // Update project from employee
      if (state.activeTab === "employee" && action.payload?.Project?.Id) {
        state.projectId = action.payload.Project.Id;
        console.log(
          `Project ID updated from employee: ${action.payload.Project.Id}`
        );
      }
    },

    // Project actions
    setProjectId: (state, action) => {
      state.projectId = action.payload;
      console.log(`Project ID set to: ${action.payload}`);
    },

    // Mail actions
    setMailBody: (state, action) => {
      state.mailBody = action.payload;
    },
    addCCUser: (state, action) => {
      // Prevent duplicate users
      if (!state.selectedCCUsers.some((u) => u.id === action.payload.id)) {
        state.selectedCCUsers.push(action.payload);
        state.ccAddresses = state.selectedCCUsers
          .map((u) => u.userPrincipalName)
          .join(",");
        console.log(`Added CC user: ${action.payload.displayName}`);
      }
    },
    removeCCUser: (state, action) => {
      state.selectedCCUsers = state.selectedCCUsers.filter(
        (user) => user.id !== action.payload.id
      );
      state.ccAddresses = state.selectedCCUsers
        .map((u) => u.userPrincipalName)
        .join(",");
      console.log(`Removed CC user: ${action.payload.displayName}`);
    },

    // Hyperlink actions
    addHyperlink: (state) => {
      // Ensure hyperlinks is initialized as an array
      if (!Array.isArray(state.hyperlinks)) {
        state.hyperlinks = [""];
      }

      state.hyperlinks.push("");
      console.log(
        `Added new hyperlink field, total: ${state.hyperlinks.length}`
      );
    },
    updateHyperlink: (state, action) => {
      const { index, value } = action.payload;

      // Ensure hyperlinks is initialized as an array
      if (!Array.isArray(state.hyperlinks)) {
        state.hyperlinks = [""];
      }

      // Ensure the index exists
      if (index >= 0 && index < state.hyperlinks.length) {
        state.hyperlinks[index] = value;
        console.log(`Updated hyperlink at index ${index}`);
      } else {
        console.warn(`Tried to update hyperlink at invalid index: ${index}`);
      }
    },
    removeHyperlink: (state, action) => {
      // Ensure hyperlinks is initialized as an array
      if (!Array.isArray(state.hyperlinks)) {
        state.hyperlinks = [""];
        return;
      }

      // Ensure we keep at least one hyperlink field
      if (state.hyperlinks.length > 1) {
        state.hyperlinks = state.hyperlinks.filter(
          (_, i) => i !== action.payload
        );
        console.log(
          `Removed hyperlink at index ${action.payload}, remaining: ${state.hyperlinks.length}`
        );
      } else {
        // If only one hyperlink is left, just clear its value
        state.hyperlinks = [""];
        console.log("Cleared the only hyperlink field");
      }
    },

    // File attachment actions - fixed to properly handle the file metadata
    addActFile: (state, action) => {
      console.log(
        "Adding act files:",
        Array.isArray(action.payload) ? action.payload.length : 1
      );
      // Ensure action.payload is treated as an array
      const filesToAdd = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.actFiles = [...state.actFiles, ...filesToAdd];
    },
    addPresentationFile: (state, action) => {
      console.log(
        "Adding presentation files:",
        Array.isArray(action.payload) ? action.payload.length : 1
      );
      // Ensure action.payload is treated as an array
      const filesToAdd = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.presentationFiles = [...state.presentationFiles, ...filesToAdd];
    },
    addExplanationFile: (state, action) => {
      console.log(
        "Adding explanation files:",
        Array.isArray(action.payload) ? action.payload.length : 1
      );
      // Ensure action.payload is treated as an array
      const filesToAdd = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.explanationFiles = [...state.explanationFiles, ...filesToAdd];
    },
    addOtherFile: (state, action) => {
      console.log(
        "Adding other files:",
        Array.isArray(action.payload) ? action.payload.length : 1
      );
      // Ensure action.payload is treated as an array
      const filesToAdd = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.otherFiles = [...state.otherFiles, ...filesToAdd];
    },
    removeActFile: (state, action) => {
      const index = action.payload;
      console.log(`Removing act file at index ${index}`);
      state.actFiles = state.actFiles.filter((_, i) => i !== index);
    },
    removePresentationFile: (state, action) => {
      const index = action.payload;
      console.log(`Removing presentation file at index ${index}`);
      state.presentationFiles = state.presentationFiles.filter(
        (_, i) => i !== index
      );
    },
    removeExplanationFile: (state, action) => {
      const index = action.payload;
      console.log(`Removing explanation file at index ${index}`);
      state.explanationFiles = state.explanationFiles.filter(
        (_, i) => i !== index
      );
    },
    removeOtherFile: (state, action) => {
      const index = action.payload;
      console.log(`Removing other file at index ${index}`);
      state.otherFiles = state.otherFiles.filter((_, i) => i !== index);
    },

    // Search actions
    setSearchQuery: (state, action) => {
      const { field, value } = action.payload;
      state.searchQueries[field] = value;
    },

    // Reset form
    resetForm: () => {
      console.log("Resetting form to initial state");
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(submitRequest.fulfilled, () => {
      console.log("Resetting form after successful submission");
      return initialState;
    });
  },
});

export const {
  setActiveTab,
  setRequestType,
  setSubCase,
  setSelectedEmployee,
  setProjectId,
  setMailBody,
  addCCUser,
  removeCCUser,
  addHyperlink,
  updateHyperlink,
  removeHyperlink,
  addActFile,
  addPresentationFile,
  addExplanationFile,
  addOtherFile,
  removeActFile,
  removePresentationFile,
  removeExplanationFile,
  removeOtherFile,
  setSearchQuery,
  resetForm,
} = formDataSlice.actions;

export default formDataSlice.reducer;
