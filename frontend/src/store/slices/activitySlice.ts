import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Post } from "../../types/post";

export type ActivityItem = {
  id: string; // post id
  contentPreview: string;
  image?: string;
  authorName?: string;
  createdAt?: string;
  likedAt: string; // time when user liked
};

type ActivityState = {
  liked: Record<string, ActivityItem>;
  comments: Array<{
    id: string; // comment id
    postId: string;
    content: string;
    postPreview: string;
    image?: string;
    authorName?: string; // post author
    commentedAt: string;
  }>;
};

const initialState: ActivityState = {
  liked: {},
  comments: [],
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    likeAdded(state, action: PayloadAction<{ post: Post }>) {
      const p = action.payload.post;
      const preview = (p.content || p.caption || "").slice(0, 140);
      state.liked[p.id] = {
        id: p.id,
        contentPreview: preview,
        image: p.images?.[0],
        authorName: p.author?.username,
        createdAt: p.createdAt,
        likedAt: new Date().toISOString(),
      };
    },
    likeRemoved(state, action: PayloadAction<{ postId: string }>) {
      delete state.liked[action.payload.postId];
    },
    commentAdded(
      state,
      action: PayloadAction<{
        commentId: string;
        post: Post;
        content: string;
      }>
    ) {
      const p = action.payload.post;
      state.comments.unshift({
        id: action.payload.commentId,
        postId: p.id,
        content: action.payload.content,
        postPreview: (p.content || p.caption || "").slice(0, 140),
        image: p.images?.[0],
        authorName: p.author?.username,
        commentedAt: new Date().toISOString(),
      });
    },
    clearAll(state) {
      state.liked = {};
      state.comments = [];
    },
  },
});

export const { likeAdded, likeRemoved, commentAdded, clearAll } =
  activitySlice.actions;
export default activitySlice.reducer;
