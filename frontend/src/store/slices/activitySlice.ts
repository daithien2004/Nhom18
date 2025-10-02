import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import instance from '../../api/axiosInstant';

export type Activity = {
  id: string;
  type: 'like' | 'comment' | 'share' | string;
  actor?: {
    id?: string;
    username?: string;
    avatar?: string;
  };
  post?: {
    id?: string;
    content?: string;
    images?: string[];
    author?: { username?: string };
  };
  comment?: {
    id?: string;
    content?: string;
    author?: { id?: string; username?: string; avatar?: string };
  };
  createdAt?: string;
  postOwner?: {
    id: string;
    username: string;
    avatar?: string;
  };
};

interface ActivityState {
  activities: Activity[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
};

// thunk: lấy activities (page + limit)
export const fetchActivities = createAsyncThunk<
  { activities: Activity[]; page: number },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>(
  'activities/fetchActivities',
  async (payload = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10 } = payload;
      const res = await instance.get('/activities', {
        params: { page, limit },
      });
      // backend trả về mảng activity trong res.data
      return { activities: res.data as Activity[], page };
    } catch (err) {
      return rejectWithValue('Lỗi khi tải activity');
    }
  }
);

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    resetActivities: (state) => {
      state.activities = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchActivities.fulfilled,
        (
          state,
          action: PayloadAction<{ activities: Activity[]; page: number }>
        ) => {
          state.isLoading = false;
          if (action.payload.page === 1) {
            state.activities = action.payload.activities;
          } else {
            state.activities = [
              ...state.activities,
              ...action.payload.activities,
            ];
          }
          state.hasMore = action.payload.activities.length > 0;
          state.page = action.payload.page;
        }
      )
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Lỗi';
      });
  },
});

export const { resetActivities } = activitySlice.actions;
export default activitySlice.reducer;
