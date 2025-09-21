import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import instance from "../../api/axiosInstant";
import type { Post, Tab } from "../../types/post";

interface PostsState {
  posts: Post[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
}

const initialState: PostsState = {
  posts: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  isError: false,
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ tab, page }: { tab: Tab; page: number }) => {
    const res = await instance.get(`/posts?type=${tab}&limit=3&page=${page}`);
    return res.data as Post[];
  }
);

export const toggleLikePost = createAsyncThunk(
  "posts/toggleLikePost",
  async (postId: string) => {
    const res = await instance.post(`/posts/${postId}/like`);
    return { postId, likeCount: res.data.likeCount };
  }
);

// Thêm createAsyncThunk cho share post
export const sharePost = createAsyncThunk(
  "posts/sharePost",
  async ({ postId, caption }: { postId: string; caption: string }) => {
    const res = await instance.post(`/posts/${postId}/share`, { caption });
    // Giả sử API trả về post mới (shared post)
    return res.data as Post;
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetPosts(state) {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.isLoading = false;
      state.isError = false;
    },
    incrementPage(state) {
      state.page += 1;
    },
    addNewPost(state, action: PayloadAction<Post>) {
      state.posts.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.page === 1) state.posts = action.payload;
        else state.posts = [...state.posts, ...action.payload];
        state.hasMore = action.payload.length === 3;
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const { postId, likeCount } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) post.likes = new Array(likeCount).fill("x");
      })
      // Xử lý sharePost
      .addCase(sharePost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        state.isLoading = false;
        // Thêm post mới vào đầu danh sách
        state.posts.unshift(action.payload);
      })
      .addCase(sharePost.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { resetPosts, incrementPage, addNewPost } = postsSlice.actions;
export default postsSlice.reducer;
