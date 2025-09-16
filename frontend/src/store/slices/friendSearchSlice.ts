// src/store/slices/friendSearchSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../../api/axiosInstant";

// Async thunk chỉ dùng cho Sidebar search
export const searchAllUsers = createAsyncThunk(
  "friendSearch/searchAllUsers",
  async (q: string) => {
    const res = await instance.get(`/friends/search-all?q=${q}`);
    return res.data;
  }
);

interface FriendSearchState {
  results: any[];
  isLoading: boolean;
  isError: boolean;
}

const initialState: FriendSearchState = {
  results: [],
  isLoading: false,
  isError: false,
};

const friendSearchSlice = createSlice({
  name: "friendSearch",
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.isLoading = false;
      state.isError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(searchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(searchAllUsers.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { clearResults } = friendSearchSlice.actions;
export default friendSearchSlice.reducer;
