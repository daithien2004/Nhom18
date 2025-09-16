// src/store/slices/friendListSearchSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../../api/axiosInstant";

// Async thunk chỉ dùng cho FriendList search
export const searchFriends = createAsyncThunk(
  "friendListSearch/searchFriends",
  async (q: string) => {
    const res = await instance.get(`/friends/search-friends?q=${q}`);
    return res.data;
  }
);

interface FriendListSearchState {
  results: any[];
  isLoading: boolean;
  isError: boolean;
}

const initialState: FriendListSearchState = {
  results: [],
  isLoading: false,
  isError: false,
};

const friendListSearchSlice = createSlice({
  name: "friendListSearch",
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
      .addCase(searchFriends.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(searchFriends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(searchFriends.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { clearResults } = friendListSearchSlice.actions;
export default friendListSearchSlice.reducer;
