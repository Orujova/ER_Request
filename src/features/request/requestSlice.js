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
    updateMessage: (state, action) => {
      const { id, message, isEdited } = action.payload;
      const messageIndex = state.messages.findIndex((msg) => msg.id === id);
      if (messageIndex !== -1) {
        state.messages[messageIndex].message = message;
        state.messages[messageIndex].isEdited = isEdited;
      }
    },
    deleteMessage: (state, action) => {
      const messageId = action.payload;
      state.messages = state.messages.filter((msg) => msg.id !== messageId);
    },
  },
});

export const {
  setRequest,
  addMessage,
  setMessages,
  updateMessage,
  deleteMessage,
} = requestSlice.actions;

export default requestSlice.reducer;
