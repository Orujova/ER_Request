// requestSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentRequest: null,
  messages: [],
  loading: false,
  error: null,
};

export const requestSlice = createSlice({
  name: "request",
  initialState,
  reducers: {
    setRequest: (state, action) => {
      state.currentRequest = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
});

export const { setRequest, addMessage, setMessages } = requestSlice.actions;
export default requestSlice.reducer;
