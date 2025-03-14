// src/redux/slices/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isTemplatePanelOpen: false,
    activeTemplateType: null, // 'act', 'presentation', or 'explanation'
  },
  reducers: {
    openTemplatePanel: (state, action) => {
      state.isTemplatePanelOpen = true;
      state.activeTemplateType = action.payload; // 'act', 'presentation', or 'explanation'
      console.log(`Template panel opened with type: ${action.payload}`);
    },
    closeTemplatePanel: (state) => {
      state.isTemplatePanelOpen = false;
      console.log("Template panel closed");
    },
  },
});

export const { openTemplatePanel, closeTemplatePanel } = uiSlice.actions;

export default uiSlice.reducer;
