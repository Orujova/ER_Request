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
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const { id, message, isEdited } = action.payload;
      const index = state.messages.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        state.messages[index].message = message;
        state.messages[index].isEdited = isEdited;
      }
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearRequest: (state) => {
      state.currentRequest = null;
      state.messages = [];
    },
  },
});

export const {
  setRequest,
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  setLoading,
  setError,
  clearRequest,
} = requestSlice.actions;

export default requestSlice.reducer;
