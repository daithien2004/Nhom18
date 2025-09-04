// features/postDetailSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import instance from "../../api/axiosInstant";
import type { PostDetail } from "../../types/post";

// =====================
// Async thunk
// =====================
export const fetchPostDetail = createAsyncThunk(
  "posts/getPostDetail",
  async (postId: string) => {
    const res = await instance.get(`/posts/${postId}`);
    return res.data as PostDetail;
  }
);

export const toggleLikeDetail = createAsyncThunk(
  "posts/toggleLikeDetail",
  async (postId: string) => {
    const res = await instance.post(`/posts/${postId}/like`);
    return res.data as { likeCount: number; isLiked: boolean };
  }
);

// =====================
// Slice
// =====================
interface PostDetailState {
  postDetail: PostDetail | null;
  isLoading: boolean;
  isError: boolean;
}

const initialState: PostDetailState = {
  postDetail: null,
  isLoading: false,
  isError: false,
};

const postDetailSlice = createSlice({
  name: "postDetail",
  initialState,
  reducers: {
    clearPostDetail: (state) => {
      state.postDetail = null;
      state.isLoading = false;
      state.isError = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPostDetail.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
    });
    builder.addCase(
      fetchPostDetail.fulfilled,
      (state, action: PayloadAction<PostDetail>) => {
        state.isLoading = false;
        state.postDetail = action.payload;
      }
    );
    builder.addCase(fetchPostDetail.rejected, (state) => {
      state.isLoading = false;
      state.isError = true;
      state.postDetail = null;
    });
    builder.addCase(toggleLikeDetail.fulfilled, (state, action) => {
      if (state.postDetail) {
        state.postDetail.likeCount = action.payload.likeCount;
        state.postDetail.isLikedByCurrentUser = action.payload.isLiked;
      }
    });
  },
});

export const { clearPostDetail } = postDetailSlice.actions;
export default postDetailSlice.reducer;
