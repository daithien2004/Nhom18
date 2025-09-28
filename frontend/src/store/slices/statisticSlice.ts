import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchStatistics } from "../thunks/statisticThunks";

export interface Like {
  username: string;
  avatar: string;
  id: string;
}

export interface LikeByPost {
  postId: string;
  content: string;
  likesCount: number;
  likes: Like[];
  createdAt: string;
}

export interface StatisticsData {
  totalLikes: number;
  totalComments: number;
  totalFriends: number;
  totalPosts: number;
  likesByPost: LikeByPost[];
}

type StatisticState = {
  data: StatisticsData | null;
  loading: {
    fetchStatistics: boolean;
  };
  error: string | null;
};

const initialState: StatisticState = {
  data: null,
  loading: {
    fetchStatistics: false,
  },
  error: null,
};

const statisticSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearStatistics(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: StatisticState) => {
      state.loading.fetchStatistics = true;
      state.error = null;
    };

    const handleRejected = (state: StatisticState, action: any) => {
      state.loading.fetchStatistics = false;
      state.error = action.payload || "Có lỗi xảy ra khi tải thống kê";
    };

    builder
      // Fetch Statistics
      .addCase(fetchStatistics.pending, handlePending)
      .addCase(
        fetchStatistics.fulfilled,
        (state, action: PayloadAction<StatisticsData>) => {
          state.loading.fetchStatistics = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchStatistics.rejected, handleRejected);
  },
});

export const { clearError, clearStatistics } = statisticSlice.actions;
export default statisticSlice.reducer;
