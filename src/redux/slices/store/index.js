// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";

import ReReducer from "../../../features/request/requestSlice";

export const store = configureStore({
  reducer: {
    request: ReReducer,
  },
});

export default store;
