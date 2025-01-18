import { configureStore } from "@reduxjs/toolkit";
import requestReducer from "../features/request/requestSlice";

export const store = configureStore({
  reducer: {
    request: requestReducer,
  },
});

export default store;
