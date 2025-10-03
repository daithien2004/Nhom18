import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../../api/axiosInstant";
import type { FriendRequest, FriendUser } from "../../types/friend";

// =====================
// Slice
// =====================

interface FriendState {
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  friends: FriendUser[];
  isLoadingFriends: boolean;
  isLoadingIncoming: boolean;
  isLoadingOutgoing: boolean;
  isError: boolean;
}

const initialState: FriendState = {
  incomingRequests: [],
  outgoingRequests: [],
  friends: [],
  isLoadingFriends: false,
  isLoadingIncoming: false,
  isLoadingOutgoing: false,
  isError: false,
};

// =====================
// Async thunk
// =====================

// Lấy danh sách bạn bè
export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async () => {
    const res = await instance.get("/friends");
    return res.data as FriendUser[];
  }
);

// Lấy lời mời nhận
export const fetchIncomingRequests = createAsyncThunk(
  "friends/fetchIncomingRequests",
  async () => {
    const res = await instance.get("/friends/requests/received");
    return res.data.map((item: any) => ({
      id: item.from.id,
      username: item.from.username,
      avatar: item.from.avatar,
      isOnline: item.from.isOnline,
      status: item.status,
    })) as FriendRequest[];
  }
);

// Lấy lời mời đã gửi
export const fetchOutgoingRequests = createAsyncThunk(
  "friends/fetchOutgoingRequests",
  async () => {
    const res = await instance.get("/friends/requests/sent");
    return res.data.map((item: any) => ({
      id: item.to.id,
      username: item.to.username,
      avatar: item.to.avatar,
      isOnline: item.to.isOnline,
      status: item.status,
    })) as FriendRequest[];
  }
);

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = createAsyncThunk(
  "friends/acceptFriendRequest",
  async (fromUserId: string) => {
    await instance.post("/friends/requests/accept", { fromUserId });
    return fromUserId;
  }
);

// Hủy lời mời kết bạn
export const unFriend = createAsyncThunk(
  "friends/unFriend",
  async (targetUserId: string) => {
    await instance.post("friends/cancel", { targetUserId });
    return targetUserId;
  }
);

// Từ chối lời mời kết bạn
export const rejectFriendRequest = createAsyncThunk(
  "friends/rejectFriendRequest",
  async (fromUserId: string) => {
    await instance.post("/friends/requests/reject", { fromUserId });
    return fromUserId;
  }
);

// Gửi lời mời kết bạn
export const sendFriendRequest = createAsyncThunk(
  "friends/sendFriendRequest",
  async (toUserId: string) => {
    await instance.post("/friends/request", { toUserId });
    return toUserId; // trả về id để update state
  }
);

// --- Slice ---
const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Friends ---
      .addCase(fetchFriends.pending, (state) => {
        state.isLoadingFriends = true;
        state.isError = false;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.isLoadingFriends = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state) => {
        state.isLoadingFriends = false;
        state.isError = true;
      })

      // --- Incoming Requests ---
      .addCase(fetchIncomingRequests.pending, (state) => {
        state.isLoadingIncoming = true;
        state.isError = false;
      })
      .addCase(fetchIncomingRequests.fulfilled, (state, action) => {
        state.isLoadingIncoming = false;
        state.incomingRequests = action.payload;
      })
      .addCase(fetchIncomingRequests.rejected, (state) => {
        state.isLoadingIncoming = false;
        state.isError = true;
      })

      // --- Outgoing Requests ---
      .addCase(fetchOutgoingRequests.pending, (state) => {
        state.isLoadingOutgoing = true;
        state.isError = false;
      })
      .addCase(fetchOutgoingRequests.fulfilled, (state, action) => {
        state.isLoadingOutgoing = false;
        state.outgoingRequests = action.payload;
      })
      .addCase(fetchOutgoingRequests.rejected, (state) => {
        state.isLoadingOutgoing = false;
        state.isError = true;
      })

      // --- Accept Friend ---
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.incomingRequests = state.incomingRequests.filter(
          (r) => r.id !== action.payload
        );
        // Tự động thêm vào danh sách bạn bè
        const acceptedUser = state.incomingRequests.find(
          (r) => r.id === action.payload
        );
        if (acceptedUser) {
          state.friends.push({
            id: acceptedUser.id,
            username: acceptedUser.username,
            avatar: acceptedUser.avatar,
            isOnline: acceptedUser.isOnline,
          });
        }
      })

      // --- Reject Friend ---
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.incomingRequests = state.incomingRequests.filter(
          (r) => r.id !== action.payload
        );
      })

      // --- Send Friend Request ---
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        const newRequest = {
          id: action.payload,
          username: "", // có thể để trống hoặc lấy từ user hiện tại nếu có
          avatar: "",
          status: "pending", // hoặc 'none' tùy kiểu
        } as FriendRequest;

        state.outgoingRequests.push(newRequest);
      })

      // --- Unfriend ---
      .addCase(unFriend.fulfilled, (state, action) => {
        const targetId = action.payload;
        state.friends = state.friends.filter((f) => f.id !== targetId);
        state.outgoingRequests = state.outgoingRequests.filter(
          (r) => r.id !== targetId
        );
        state.incomingRequests = state.incomingRequests.filter(
          (r) => r.id !== targetId
        );
      });
  },
});

export default friendSlice.reducer;
