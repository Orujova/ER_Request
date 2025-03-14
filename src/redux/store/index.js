// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";

import ReReducer from "../slices/requestSlice";
import dashboardReducer from "../slices/dashboardSlice";

import erMembersReducer from "../slices/erMembersSlice";

export const store = configureStore({
  reducer: {
    request: ReReducer,
    dashboard: dashboardReducer,
    erMembers: erMembersReducer,
  },
});

export default store;
