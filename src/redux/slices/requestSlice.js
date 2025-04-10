import { createSlice } from "@reduxjs/toolkit";
import {
  fetchRequestData,
  fetchMessages,
  fetchERMembers,
  fetchChildRequests,
  sendMessage,
  editMessage,
  deleteMessageThunk,
} from "./requestThunks";

const initialState = {
  currentRequest: null,
  messages: [],
  erMembers: [],
  childRequests: [],
  loading: false,
  attachmentsLoading: false,
  messagesLoading: false,
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
    setAttachmentsLoading: (state, action) => {
      state.attachmentsLoading = action.payload;
    },
    setMessagesLoading: (state, action) => {
      state.messagesLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearRequest: (state) => {
      state.currentRequest = null;
      state.messages = [];
    },
    setERMembers: (state, action) => {
      state.erMembers = action.payload;
    },
    setChildRequests: (state, action) => {
      state.childRequests = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchRequestData
    builder
      .addCase(fetchRequestData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchRequestData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle fetchMessages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      });

    // Handle fetchERMembers
    builder.addCase(fetchERMembers.fulfilled, (state, action) => {
      state.erMembers = action.payload;
    });

    // Handle fetchChildRequests
    builder.addCase(fetchChildRequests.fulfilled, (state, action) => {
      state.childRequests = action.payload;
    });

    // Handle sendMessage
    builder
      .addCase(sendMessage.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.messagesLoading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      });

    // Handle editMessage
    builder
      .addCase(editMessage.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(editMessage.fulfilled, (state) => {
        state.messagesLoading = false;
      })
      .addCase(editMessage.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      });

    // Handle deleteMessage
    builder
      .addCase(deleteMessageThunk.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(deleteMessageThunk.fulfilled, (state) => {
        state.messagesLoading = false;
      })
      .addCase(deleteMessageThunk.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      });
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
  setERMembers,
  setChildRequests,
  setAttachmentsLoading,
  setMessagesLoading,
} = requestSlice.actions;

// Selectors
export const selectCurrentRequest = (state) => state.request.currentRequest;
export const selectMessages = (state) => state.request.messages;
export const selectERMembers = (state) => state.request.erMembers;
export const selectChildRequests = (state) => state.request.childRequests;
export const selectIsLoading = (state) => state.request.loading;
export const selectIsMessagesLoading = (state) => state.request.messagesLoading;
export const selectIsAttachmentsLoading = (state) =>
  state.request.attachmentsLoading;
export const selectError = (state) => state.request.error;

export default requestSlice.reducer;
