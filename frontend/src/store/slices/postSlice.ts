import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import instance from '../../api/axiosInstant';
import type { Comment, Post, PostDetail, Tab } from '../../types/post';

// Định nghĩa interface cho Likes
interface Like {
  isLiked: boolean;
  likeCount: number;
  likes: { userId: string; username: string; avatar: string }[];
}

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
  isDeleting: boolean;
  deleteError: string | null;
  isUpdating: boolean;
  updateError: string | null;
  error: string | null;
  likes: { [postId: string]: Like };
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
  isDeleting: false,
  deleteError: null,
  isUpdating: false,
  updateError: null,
  error: null,
  likes: {},
};

// Thunk để tạo bài viết
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (
    postData: { content: string; images: string[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post('/posts', postData);
      return res.data as Post;
    } catch (err) {
      return rejectWithValue('Không thể tạo bài viết');
    }
  }
);

// Thunk để lấy danh sách bài viết
export const fetchPostsThunk = createAsyncThunk(
  'posts/fetchPosts',
  async (
    {
      tab,
      page,
      limit = 20,
      replace,
      userId,
    }: {
      tab?: Tab;
      page: number;
      limit?: number;
      replace: boolean;
      userId: string | undefined;
    },
    { rejectWithValue }
  ) => {
    try {
      let url = `/posts`;
      if (userId) {
        url += `/user/${userId}?limit=${limit}&page=${page}`;
      } else if (tab) {
        url += `?type=${tab}&limit=${limit}&page=${page}`;
      } else {
        return rejectWithValue('Thiếu tham số tab hoặc isMyPosts');
      }
      const res = await instance.get(url);
      return { posts: res.data as Post[], replace };
    } catch (err) {
      return rejectWithValue('Lỗi khi tải bài viết');
    }
  }
);

// Thunk để lấy chi tiết bài viết
export const fetchPostDetail = createAsyncThunk(
  'posts/getPostDetail',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await instance.get(`/posts/${postId}`);
      console.log(res);
      return res.data as PostDetail;
    } catch (err) {
      return rejectWithValue('Lỗi khi tải chi tiết bài viết');
    }
  }
);

// Thunk để xóa bài viết
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await instance.delete(`/posts/${postId}`);
      return postId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể xóa bài viết'
      );
    }
  }
);

// Thunk để cập nhật bài viết
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async (
    {
      postId,
      content,
      images,
    }: { postId: string; content: string; images: string[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.put(`/posts/${postId}`, { content, images });
      return res.data as Post;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể cập nhật bài viết'
      );
    }
  }
);

// Thunk chung để thích bài viết
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId }: { postId: string }, { rejectWithValue }) => {
    try {
      const res = await instance.post(`/posts/${postId}/like`);
      return {
        postId,
        likeCount: res.data.likeCount,
        isLiked: res.data.isLiked,
        likes: res.data.likes,
      };
    } catch (err) {
      return rejectWithValue('Lỗi khi thích bài viết');
    }
  }
);

// Thunk để thêm bình luận
export const addComment = createAsyncThunk(
  'posts/addComment',
  async (
    { postId, content }: { postId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post(`/posts/${postId}/comments`, { content });
      return {
        comment: res.data as Comment,
        postId,
      };
    } catch (err) {
      return rejectWithValue('Lỗi khi thêm bình luận');
    }
  }
);

// Thunk cho share post
export const sharePost = createAsyncThunk(
  'posts/sharePost',
  async (
    { postId, caption }: { postId: string; caption: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.post(`/posts/${postId}/share`, { caption });
      return res.data as Post;
    } catch (err) {
      return rejectWithValue('Lỗi khi chia sẻ bài viết');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async (
    { postId, commentId }: { postId: string; commentId: string },
    { rejectWithValue }
  ) => {
    try {
      await instance.delete(`/posts/${postId}/comments/${commentId}`);
      return { postId, commentId };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể xóa bình luận'
      );
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
      state.likes = {};
    },
    addNewPost: (state, action: PayloadAction<Post>) => {
      state.posts = [action.payload, ...state.posts];
      state.likes[action.payload.id] = {
        isLiked: action.payload.isLikedByCurrentUser || false,
        likeCount: action.payload.likeCount || 0,
        likes: action.payload.likes || [],
      };
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
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
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
        action.payload.posts.forEach((post) => {
          state.likes[post.id] = {
            isLiked: post.isLikedByCurrentUser || false,
            likeCount: post.likeCount || 0,
            likes: post.likes || [],
          };
        });
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
          state.likes[action.payload.id] = {
            isLiked: action.payload.isLikedByCurrentUser || false,
            likeCount: action.payload.likeCount || 0,
            likes: action.payload.likes || [],
          };
        }
      )
      .addCase(fetchPostDetail.rejected, (state) => {
        state.isLoadingDetail = false;
        state.isErrorDetail = true;
        state.postDetail = null;
      });

    // Delete post
    builder
      .addCase(deletePost.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        const deletedPostId = action.payload;

        // Xóa khỏi danh sách posts
        state.posts = state.posts.filter((post) => post.id !== deletedPostId);

        // Xóa khỏi likes
        delete state.likes[deletedPostId];

        // Nếu đang xem detail của post này thì clear
        if (state.postDetail?.id === deletedPostId) {
          state.postDetail = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });

    // Update post
    builder
      .addCase(updatePost.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updatePost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isUpdating = false;
        const updatedPost = action.payload;

        // Cập nhật trong danh sách posts
        const index = state.posts.findIndex((p) => p.id === updatedPost.id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }

        // Cập nhật postDetail nếu đang xem
        if (state.postDetail?.id === updatedPost.id) {
          state.postDetail = {
            ...state.postDetail,
            content: updatedPost.content,
            images: updatedPost.images,
            updatedAt: updatedPost.updatedAt!,
          };
        }

        // Cập nhật likes
        state.likes[updatedPost.id] = {
          isLiked: updatedPost.isLikedByCurrentUser || false,
          likeCount: updatedPost.likeCount || 0,
          likes: updatedPost.likes || [],
        };
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      });

    // Toggle like
    builder
      .addCase(toggleLike.pending, (state, action) => {
        const postId = action.meta.arg.postId;
        const currentLike = state.likes[postId] || {
          isLiked: false,
          likeCount: 0,
          likes: [],
        };
        state.likes[postId] = {
          ...currentLike,
          isLiked: !currentLike.isLiked,
          likeCount: currentLike.isLiked
            ? currentLike.likeCount - 1
            : currentLike.likeCount + 1,
        };
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, isLiked, likeCount, likes } = action.payload;
        state.likes[postId] = { isLiked, likeCount, likes };
      })
      .addCase(toggleLike.rejected, (state, action) => {
        const postId = action.meta.arg.postId;
        const currentLike = state.likes[postId];
        state.likes[postId] = {
          ...currentLike,
          isLiked: !currentLike.isLiked,
          likeCount: currentLike.isLiked
            ? currentLike.likeCount - 1
            : currentLike.likeCount + 1,
        };
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
        if (
          state.postDetail &&
          state.postDetail.id === action.meta.arg.postId
        ) {
          const tempComment: Comment = {
            id: `temp-${Date.now()}`,
            content: action.meta.arg.content,
            author: {
              id: 'temp-user',
              username: 'Đang tải...',
              avatar: '/default-avatar.png',
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
          state.postDetail.comments = state.postDetail.comments.map((c) =>
            c.id.startsWith('temp-') ? action.payload.comment : c
          );
          state.postDetail.commentCount = state.postDetail.comments.length;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isCommenting = false;
        state.commentError = action.payload as string;
        if (state.postDetail) {
          state.postDetail.comments = state.postDetail.comments.filter(
            (c) => !c.id.startsWith('temp-')
          );
          state.postDetail.commentCount = state.postDetail.comments.length;
        }
      });

    // Share post
    builder
      .addCase(sharePost.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(sharePost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isCreating = false;
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteComment.pending, (state) => {
        state.isCommenting = true;
        state.commentError = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isCommenting = false;
        const { postId, commentId } = action.payload;

        // Xóa comment khỏi postDetail
        if (state.postDetail && state.postDetail.id === postId) {
          state.postDetail.comments = state.postDetail.comments.filter(
            (c) => c.id !== commentId
          );
          state.postDetail.commentCount = state.postDetail.comments.length;
        }

        // Xóa comment khỏi danh sách posts
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.commentCount = (post.commentCount || 1) - 1;
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isCommenting = false;
        state.commentError = action.payload as string;
      });
  },
});

export const {
  resetPosts,
  addNewPost,
  clearPostDetail,
  clearCreateError,
  clearCommentError,
  clearDeleteError,
  clearUpdateError,
} = postSlice.actions;
export default postSlice.reducer;
