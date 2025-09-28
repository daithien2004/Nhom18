import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import instance from "../../api/axiosInstant";
import type { Comment, Post, PostDetail, Tab } from "../../types/post";

interface PostState {
  posts: Post[];
  page: number;
  hasMore: boolean;
  initialLoading: boolean;
  loadingMore: boolean;
  postDetail: PostDetail | null;
  isLoadingDetail: boolean;
  isErrorDetail: boolean;
  isCreating: boolean;
  createError: string | null;
  isCommenting: boolean;
  commentError: string | null;
  error: string | null;
}

const initialState: PostState = {
  posts: [],
  page: 1,
  hasMore: true,
  initialLoading: false,
  loadingMore: false,
  postDetail: null,
  isLoadingDetail: false,
  isErrorDetail: false,
  isCreating: false,
  createError: null,
  isCommenting: false,
  commentError: null,
  error: null,
};

// Thunk để tạo bài viết
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (
    postData: { content: string; images: string[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post("/posts", postData);
      return res.data as Post;
    } catch (err) {
      return rejectWithValue("Không thể tạo bài viết");
    }
  }
);

// Thunk để lấy danh sách bài viết
export const fetchPostsThunk = createAsyncThunk(
  "posts/fetchPosts",
  async (
    {
      tab,
      page,
      limit,
      replace,
    }: { tab: Tab; page: number; limit: number; replace: boolean },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.get(
        `/posts?type=${tab}&limit=${limit}&page=${page}`
      );
      const raw = res.data as any[];
      const posts: Post[] = (raw || []).map((p: any) => ({
        id: p._id || p.id,
        content: p.content,
        caption: p.caption,
        images: Array.isArray(p.images) ? p.images : [],
        author: {
          username: p.author?.username ?? "Ẩn danh",
          avatar: p.author?.avatar ?? "/default-avatar.png",
        },
        likes: Array.isArray(p.likes) ? p.likes : [],
        comments: Array.isArray(p.comments) ? p.comments : [],
        shares: Array.isArray(p.shares) ? p.shares : [],
        views: typeof p.views === "number" ? p.views : 0,
        sharedFrom: p.sharedFrom
          ? {
              id: p.sharedFrom._id || p.sharedFrom.id,
              content: p.sharedFrom.content,
              caption: p.sharedFrom.caption,
              images: Array.isArray(p.sharedFrom.images)
                ? p.sharedFrom.images
                : [],
              author: {
                username: p.sharedFrom.author?.username ?? "Ẩn danh",
                avatar: p.sharedFrom.author?.avatar ?? "/default-avatar.png",
              },
              likes: [],
              comments: [],
              shares: [],
              views: 0,
              createdAt: p.sharedFrom.createdAt,
            }
          : undefined,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      return { posts, replace };
    } catch (err) {
      return rejectWithValue("Lỗi khi tải bài viết");
    }
  }
);

// Thunk để lấy chi tiết bài viết
export const fetchPostDetail = createAsyncThunk(
  "posts/getPostDetail",
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await instance.get(`/posts/${postId}`);
      const d = res.data as any;
      const detail: PostDetail = {
        id: d._id || d.id,
        author: {
          id: d.author?._id || d.author?.id || "",
          username: d.author?.username ?? "Ẩn danh",
          avatar: d.author?.avatar ?? "/default-avatar.png",
          isOnline: !!d.author?.isOnline,
        },
        caption: d.caption,
        content: d.content,
        images: Array.isArray(d.images) ? d.images : [],
        likes: Array.isArray(d.likes) ? d.likes : [],
        comments: (Array.isArray(d.comments) ? d.comments : []).map(
          (c: any) => ({
            id: c._id || c.id,
            content: c.content,
            author: {
              id: c.author?._id || c.author?.id || "",
              username: c.author?.username ?? "Ẩn danh",
              avatar: c.author?.avatar ?? "/default-avatar.png",
            },
            createdAt: c.createdAt,
          })
        ),
        views: typeof d.views === "number" ? d.views : 0,
        shares: Array.isArray(d.shares) ? d.shares : [],
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        __v: d.__v ?? 0,
        likeCount: d.likeCount ?? (Array.isArray(d.likes) ? d.likes.length : 0),
        commentCount:
          d.commentCount ?? (Array.isArray(d.comments) ? d.comments.length : 0),
        shareCount:
          d.shareCount ?? (Array.isArray(d.shares) ? d.shares.length : 0),
        isLikedByCurrentUser: !!d.isLikedByCurrentUser,
        isSharedByCurrentUser: !!d.isSharedByCurrentUser,
        sharedFrom: d.sharedFrom
          ? {
              id: d.sharedFrom._id || d.sharedFrom.id,
              author: {
                id: d.sharedFrom.author?._id || d.sharedFrom.author?.id || "",
                username: d.sharedFrom.author?.username ?? "Ẩn danh",
                avatar: d.sharedFrom.author?.avatar ?? "/default-avatar.png",
                isOnline: !!d.sharedFrom.author?.isOnline,
              },
              caption: d.sharedFrom.caption,
              content: d.sharedFrom.content,
              images: Array.isArray(d.sharedFrom.images)
                ? d.sharedFrom.images
                : [],
              likes: [],
              comments: [],
              views: 0,
              shares: [],
              createdAt: d.sharedFrom.createdAt,
              updatedAt: d.sharedFrom.updatedAt,
              __v: d.sharedFrom.__v ?? 0,
              likeCount: 0,
              commentCount: 0,
              shareCount: 0,
              isLikedByCurrentUser: false,
              isSharedByCurrentUser: false,
              sharedFrom: null,
            }
          : undefined,
      };
      return detail;
    } catch (err) {
      return rejectWithValue("Lỗi khi tải chi tiết bài viết");
    }
  }
);

// Thunk chung để thích bài viết
export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (
    { postId, isPostList }: { postId: string; isPostList: boolean },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post(`/posts/${postId}/like`);
      return {
        postId,
        likeCount: res.data.likeCount,
        isLiked: res.data.isLiked,
        isPostList,
      };
    } catch (err) {
      return rejectWithValue("Lỗi khi thích bài viết");
    }
  }
);

// Thunk để thêm bình luận
export const addComment = createAsyncThunk(
  "posts/addComment",
  async (
    { postId, content }: { postId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post(`/posts/${postId}/comments`, { content });
      return {
        comment: res.data as Comment, // API trả về comment mới
        postId,
      };
    } catch (err) {
      return rejectWithValue("Lỗi khi thêm bình luận");
    }
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

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    addNewPost: (state, action: PayloadAction<Post>) => {
      state.posts = [action.payload, ...state.posts];
    },
    clearPostDetail: (state) => {
      state.postDetail = null;
      state.isLoadingDetail = false;
      state.isErrorDetail = false;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearCommentError: (state) => {
      state.commentError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch posts
    builder
      .addCase(fetchPostsThunk.pending, (state, action) => {
        if (action.meta.arg.page === 1) state.initialLoading = true;
        else state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchPostsThunk.fulfilled, (state, action) => {
        state.initialLoading = false;
        state.loadingMore = false;
        state.posts = action.payload.replace
          ? action.payload.posts
          : [...state.posts, ...action.payload.posts];
        state.hasMore = action.payload.posts.length === action.meta.arg.limit;
        state.page = action.meta.arg.page;
      })
      .addCase(fetchPostsThunk.rejected, (state, action) => {
        state.initialLoading = false;
        state.loadingMore = false;
        state.error = action.payload as string;
      });

    // Fetch post detail
    builder
      .addCase(fetchPostDetail.pending, (state) => {
        state.isLoadingDetail = true;
        state.isErrorDetail = false;
      })
      .addCase(
        fetchPostDetail.fulfilled,
        (state, action: PayloadAction<PostDetail>) => {
          state.isLoadingDetail = false;
          state.postDetail = action.payload;
        }
      )
      .addCase(fetchPostDetail.rejected, (state) => {
        state.isLoadingDetail = false;
        state.isErrorDetail = true;
        state.postDetail = null;
      });

    // Toggle like
    builder
      .addCase(toggleLike.pending, (state, action) => {
        if (action.meta.arg.isPostList) {
          state.posts = state.posts.map((p) =>
            p.id === action.meta.arg.postId
              ? {
                  ...p,
                  likes: p.likes.includes("me")
                    ? p.likes.filter((id) => id !== "me")
                    : [...p.likes, "me"],
                }
              : p
          );
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        if (action.payload.isPostList) {
          state.posts = state.posts.map((p) =>
            p.id === action.payload.postId
              ? { ...p, likes: new Array(action.payload.likeCount).fill("x") }
              : p
          );
        } else if (
          state.postDetail &&
          state.postDetail.id === action.payload.postId
        ) {
          state.postDetail.likeCount = action.payload.likeCount;
          state.postDetail.isLikedByCurrentUser = action.payload.isLiked;
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create post
    builder
      .addCase(createPost.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      });

    // Add comment
    builder
      .addCase(addComment.pending, (state, action) => {
        state.isCommenting = true;
        state.commentError = null;
        // Optimistic update
        if (
          state.postDetail &&
          state.postDetail.id === action.meta.arg.postId
        ) {
          const tempComment: Comment = {
            id: `temp-${Date.now()}`,
            content: action.meta.arg.content,
            author: {
              id: "temp-user",
              username: "Đang tải...",
              avatar: "/default-avatar.png",
            },
            createdAt: new Date().toISOString(),
          };
          state.postDetail.comments = [
            ...state.postDetail.comments,
            tempComment,
          ];
          state.postDetail.commentCount += 1;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isCommenting = false;
        if (state.postDetail && state.postDetail.id === action.payload.postId) {
          // Thay bình luận tạm thời bằng bình luận thật
          state.postDetail.comments = state.postDetail.comments.map((c) =>
            c.id.startsWith("temp-") ? action.payload.comment : c
          );
          state.postDetail.commentCount = state.postDetail.comments.length;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isCommenting = false;
        state.commentError = action.payload as string;
        if (state.postDetail) {
          state.postDetail.comments = state.postDetail.comments.filter(
            (c) => !c.id.startsWith("temp-")
          );
          state.postDetail.commentCount = state.postDetail.comments.length;
        }
      })
      .addCase(sharePost.pending, (state) => {
        // nếu muốn có state.loadingShare riêng thì thêm vào PostState
        state.isCreating = true;
      })
      .addCase(sharePost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isCreating = false;
        // Thêm post được share lên đầu danh sách
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetPosts,
  addNewPost,
  clearPostDetail,
  clearCreateError,
  clearCommentError,
} = postSlice.actions;
export default postSlice.reducer;
