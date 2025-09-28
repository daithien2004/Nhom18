import { createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../../api/axiosInstant";
import { handleApi } from "../../utils/apiClient";
import type { StatisticsData } from "../slices/statisticSlice";

// Fetch statistics
export const fetchStatistics = createAsyncThunk(
  "statistics/fetchStatistics",
  async (_, { rejectWithValue }) => {
    return handleApi(
      async () => {
        const response = await instance.get("/statistics");
        return response.data.data as StatisticsData;
      },
      rejectWithValue,
      "Không thể tải thống kê"
    );
  }
);

// Fetch total likes
export const fetchTotalLikes = createAsyncThunk(
  "statistics/fetchTotalLikes",
  async (_, { rejectWithValue }) => {
    return handleApi(
      async () => {
        const response = await instance.get("/statistics/likes");
        return response.data.data.totalLikes as number;
      },
      rejectWithValue,
      "Không thể tải tổng lượt thích"
    );
  }
);

// Fetch total comments
export const fetchTotalComments = createAsyncThunk(
  "statistics/fetchTotalComments",
  async (_, { rejectWithValue }) => {
    return handleApi(
      async () => {
        const response = await instance.get("/statistics/comments");
        return response.data.data.totalComments as number;
      },
      rejectWithValue,
      "Không thể tải tổng bình luận"
    );
  }
);

// Fetch total friends
export const fetchTotalFriends = createAsyncThunk(
  "statistics/fetchTotalFriends",
  async (_, { rejectWithValue }) => {
    return handleApi(
      async () => {
        const response = await instance.get("/statistics/friends");
        return response.data.data.totalFriends as number;
      },
      rejectWithValue,
      "Không thể tải tổng bạn bè"
    );
  }
);

// Fetch total posts
export const fetchTotalPosts = createAsyncThunk(
  "statistics/fetchTotalPosts",
  async (_, { rejectWithValue }) => {
    return handleApi(
      async () => {
        const response = await instance.get("/statistics/posts");
        return response.data.data.totalPosts as number;
      },
      rejectWithValue,
      "Không thể tải tổng bài viết"
    );
  }
);

// Fetch likes by post
export const fetchLikesByPost = createAsyncThunk(
  "statistics/fetchLikesByPost",
  async (_, { rejectWithValue }) => {
    return handleApi(
      async () => {
        const response = await instance.get("/statistics/likes-by-post");
        return response.data.data.likesByPost;
      },
      rejectWithValue,
      "Không thể tải lượt thích theo bài viết"
    );
  }
);
