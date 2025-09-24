// src/store/slices/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import {
  loginThunk,
  fetchProfile,
  requestOtpThunk,
  verifyOtpThunk,
  updateProfileThunk,
  updateAvatarThunk,
  updateCoverPhotoThunk,
} from '../thunks/authThunks';
import type { UserProfile } from '../../types/user';
import { getAccessToken, removeAccessToken } from '../../utils/authHelpers';

type AuthError = {
  message: string;
  code?: string;
};

type AuthState = {
  user: UserProfile | null;
  token: string | null;
  loading: {
    login: boolean;
    fetchProfile: boolean;
    updateProfile: boolean;
    requestOtp: boolean;
    verifyOtp: boolean;
    updateAvatar: boolean;
    updateCoverPhoto: boolean;
  };
  error: AuthError | null;
};

const initialState: AuthState = {
  user: null,
  token: getAccessToken(),
  loading: {
    login: false,
    fetchProfile: false,
    updateProfile: false,
    requestOtp: false,
    verifyOtp: false,
    updateAvatar: false,
    updateCoverPhoto: false,
  },
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      removeAccessToken();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (
      state: AuthState,
      key: keyof AuthState['loading']
    ) => {
      state.loading[key] = true;
      state.error = null;
    };

    const handleRejected = (
      state: AuthState,
      key: keyof AuthState['loading'],
      action: any
    ) => {
      state.loading[key] = false;
      state.error = action.payload;
    };
    builder
      // Login
      .addCase(loginThunk.pending, (state) => handlePending(state, 'login'))
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = {
          id: action.payload.user.id,
          email: action.payload.user.email,
          username: action.payload.user.username,
          // user chưa đủ field => tạm để null/undefined
        } as UserProfile | null;
        state.token = getAccessToken();
      })
      .addCase(loginThunk.rejected, (state, action) =>
        handleRejected(state, 'login', action)
      )
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) =>
        handlePending(state, 'fetchProfile')
      )
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading.fetchProfile = false;
        state.user = action.payload.user;
      })
      .addCase(fetchProfile.rejected, (state, action) =>
        handleRejected(state, 'fetchProfile', action)
      )
      // Request OTP
      .addCase(requestOtpThunk.pending, (state) =>
        handlePending(state, 'requestOtp')
      )
      .addCase(requestOtpThunk.fulfilled, (state) => {
        state.loading.requestOtp = false;
      })
      .addCase(requestOtpThunk.rejected, (state, action) =>
        handleRejected(state, 'requestOtp', action)
      )
      // Verify OTP
      .addCase(verifyOtpThunk.pending, (state) =>
        handlePending(state, 'verifyOtp')
      )
      .addCase(verifyOtpThunk.fulfilled, (state) => {
        state.loading.verifyOtp = false;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) =>
        handleRejected(state, 'verifyOtp', action)
      )
      // Update Profile
      .addCase(updateProfileThunk.pending, (state) =>
        handlePending(state, 'updateProfile')
      )
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading.updateProfile = false;
        state.user = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) =>
        handleRejected(state, 'updateProfile', action)
      )
      // Update Avatar
      .addCase(updateAvatarThunk.pending, (state) =>
        handlePending(state, 'updateAvatar')
      )
      .addCase(updateAvatarThunk.fulfilled, (state, action) => {
        state.loading.updateAvatar = false;
        if (state.user && action.payload) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateAvatarThunk.rejected, (state, action) =>
        handleRejected(state, 'updateAvatar', action)
      )
      // Update Cover Photo
      .addCase(updateCoverPhotoThunk.pending, (state) =>
        handlePending(state, 'updateCoverPhoto')
      )
      .addCase(updateCoverPhotoThunk.fulfilled, (state, action) => {
        state.loading.updateCoverPhoto = false;
        if (state.user && action.payload) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateCoverPhotoThunk.rejected, (state, action) =>
        handleRejected(state, 'updateCoverPhoto', action)
      );
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
