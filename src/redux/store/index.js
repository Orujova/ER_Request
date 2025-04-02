// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";

// Import existing reducers
import requestReducer from "../slices/requestSlice";
import dashboardReducer from "../slices/dashboardSlice";
import erMembersReducer from "../slices/erMembersSlice";

// Import new reducers
import requestFormReducer from "../slices/requestFormSlice";
import formDataReducer from "../slices/formDataSlice";
import uiReducer from "../slices/uiSlice";

// Create a debug middleware to log actions and state changes
const loggerMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  return result;
};

export const store = configureStore({
  reducer: {
    // Existing reducers
    request: requestReducer,
    dashboard: dashboardReducer,
    erMembers: erMembersReducer,

    // New reducers for the form
    requestForm: requestFormReducer,
    formData: formDataReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "requestForm/fetchDependencies/fulfilled",
          "requestForm/submitRequest/pending",
        ],
        // Ignore these field paths in the state
        ignoredPaths: [
          "formData.actFiles",
          "formData.presentationFiles",
          "formData.explanationFiles",
          "formData.otherFiles",
          "formData.selectedCCUsers",
        ],
      },
    }).concat(loggerMiddleware),
});

export default store;
