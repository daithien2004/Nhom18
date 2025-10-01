import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import instance from '../../api/axiosInstant';
import type { Notification } from '../../types/notification';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await instance.get(`/notifications`, {
        params: { page, limit },
      });
      return {
        notifications: res.data.notifications as Notification[],
        total: res.data.pagination.total,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch notifications'
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const res = await instance.post('/notifications/read');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to mark all as read'
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const res = await instance.patch(`/notifications/${notificationId}/read`);
      return { notificationId, notification: res.data };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to mark as read'
      );
    }
  }
);

interface NotificationsState {
  notifications: Notification[];
  total: number;
  loadingNotifications: boolean;
  unreadCount: number;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  total: 0,
  loadingNotifications: false,
  unreadCount: 0,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = action.payload;
      // Prevent duplicate notifications
      if (!state.notifications.some((n) => n.id === notification.id)) {
        state.notifications.unshift(notification);
        state.total += 1;

        if (!notification.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    clearNotificationsState: (state) => {
      state.notifications = [];
      state.total = 0;
      state.loadingNotifications = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loadingNotifications = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loadingNotifications = false;
        const { notifications, total } = action.payload;
        // Merge notifications, avoid duplicates
        const newNotifications = notifications.filter(
          (n) => !state.notifications.some((existing) => existing.id === n.id)
        );
        state.notifications = [...state.notifications, ...newNotifications];
        state.total = total;

        // Tính lại unreadCount dựa trên toàn bộ notifications
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loadingNotifications = false;
        state.error = action.payload as string;
      });

    // Đánh dấu tất cả đã đọc
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      state.unreadCount = 0;
    });

    // Đánh dấu 1 thông báo đã đọc
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId, notification } = action.payload;
        const index = state.notifications.findIndex(
          (n) => n.id === notificationId
        );
        if (index !== -1) {
          state.notifications[index] = notification;
          state.unreadCount = state.notifications.filter(
            (n) => !n.isRead
          ).length;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { addNotification, clearNotificationsState } =
  notificationSlice.actions;
export default notificationSlice.reducer;
