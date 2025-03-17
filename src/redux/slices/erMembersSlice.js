import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

export const fetchERMembers = createAsyncThunk(
  "erMembers/fetchERMembers",
  async (_, { rejectWithValue }) => {
    try {
      const { jwtToken } = getStoredTokens();

      const response = await fetch(
        `${API_BASE_URL}/api/AdminApplicationUser/GetAllERMemberUser`,
        {
          headers: {
            "ngrok-skip-browser-warning": "narmin",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ER members: ${response.status}`);
      }

      const data = await response.json();
      return data[0].AppUsers || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  erMembers: [],
  loading: false,
  error: null,
};

const erMembersSlice = createSlice({
  name: "erMembers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchERMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchERMembers.fulfilled, (state, action) => {
        state.erMembers = action.payload;
        state.loading = false;
      })
      .addCase(fetchERMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default erMembersSlice.reducer;
