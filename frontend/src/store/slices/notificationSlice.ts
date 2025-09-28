import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import instance from '../../api/axiosInstant';
import type { Notification } from '../../types/notification';
// import { addMessage } from '../slices/conversationSlice';
// import { type Message } from '../../types/message';

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

// export const markNotificationAsRead = createAsyncThunk(
//   'notifications/markNotificationAsRead',
//   async (id: string, { rejectWithValue }) => {
//     try {
//       await instance.patch(`/notifications/${id}/read`);
//       return id;
//     } catch (err: any) {
//       return rejectWithValue(
//         err.response?.data?.message || 'Failed to mark notification as read'
//       );
//     }
//   }
// );

// export const markAllNotificationsAsRead = createAsyncThunk(
//   'notifications/markAllNotificationsAsRead',
//   async (userId: string, { rejectWithValue }) => {
//     try {
//       await instance.patch(`/notifications/${userId}/read-all`);
//       return userId;
//     } catch (err: any) {
//       return rejectWithValue(
//         err.response?.data?.message ||
//           'Failed to mark all notifications as read'
//       );
//     }
//   }
// );

interface NotificationsState {
  notifications: Notification[];
  total: number;
  loadingNotifications: boolean;
  //   loadingMarkAsRead: boolean;
  //   loadingMarkAllAsRead: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  total: 0,
  loadingNotifications: false,
  //   loadingMarkAsRead: false,
  //   loadingMarkAllAsRead: false,
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
      }
    },
    clearNotificationsState: (state) => {
      state.notifications = [];
      state.total = 0;
      state.loadingNotifications = false;
      //   state.loadingMarkAsRead = false;
      //   state.loadingMarkAllAsRead = false;
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
        state.notifications = [...newNotifications, ...state.notifications];
        state.total = total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loadingNotifications = false;
        state.error = action.payload as string;
      });

    // // Mark notification as read
    // builder
    //   .addCase(markNotificationAsRead.pending, (state) => {
    //     state.loadingMarkAsRead = true;
    //     state.error = null;
    //   })
    //   .addCase(markNotificationAsRead.fulfilled, (state, action) => {
    //     state.loadingMarkAsRead = false;
    //     const id = action.payload;
    //     state.notifications = state.notifications.map((n) =>
    //       n.id === id ? { ...n, read: true } : n
    //     );
    //   })
    //   .addCase(markNotificationAsRead.rejected, (state, action) => {
    //     state.loadingMarkAsRead = false;
    //     state.error = action.payload as string;
    //   });

    // // Mark all notifications as read
    // builder
    //   .addCase(markAllNotificationsAsRead.pending, (state) => {
    //     state.loadingMarkAllAsRead = true;
    //     state.error = null;
    //   })
    //   .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
    //     state.loadingMarkAllAsRead = false;
    //     state.notifications = state.notifications.map((n) => ({
    //       ...n,
    //       read: true,
    //     }));
    //   })
    //   .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
    //     state.loadingMarkAllAsRead = false;
    //     state.error = action.payload as string;
    //   });

    // // Listen to new messages from conversationSlice to create notifications
    // builder.addCase(
    //   addMessage,
    //   (
    //     state,
    //     action: PayloadAction<{ conversationId: string; message: Message }>
    //   ) => {
    //     const { message } = action.payload;
    //     const notification: Notification = {
    //       id: `notif-${message.id}`, // Unique ID for notification
    //       message: `New message from ${message.sender}: ${message.text}`,
    //       timestamp: message.createdAt,
    //       read: false,
    //     };
    //     if (!state.notifications.some((n) => n.id === notification.id)) {
    //       state.notifications.unshift(notification);
    //       state.total += 1;
    //     }
    //   }
    // );
  },
});

export const { addNotification, clearNotificationsState } =
  notificationSlice.actions;
export default notificationSlice.reducer;
