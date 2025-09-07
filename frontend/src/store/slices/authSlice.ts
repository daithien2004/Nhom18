// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  login,
  getMe,
  requestOtp,
  verifyOtp,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
} from '../../services/authService';
import type { RegisterData, UserProfile } from '../../types/auth';

// login thunk
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (dto: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await login(dto.email, dto.password); // { accessToken, user }
      // 👉 lưu accessToken vào localStorage ngay khi login thành công
      localStorage.setItem('accessToken', result.accessToken);
      return result;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || 'Login failed');
    }
  }
);

// fetch profile thunk
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getMe(); // { user }
      return result;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || 'Fetch profile failed');
    }
  }
);
// update profile thunk
export const updateProfileThunk = createAsyncThunk(
  'users/update-profile',
  async (
    updates: Partial<
      Pick<UserProfile, 'phone' | 'gender' | 'birthday' | 'bio'>
    >,
    { rejectWithValue }
  ) => {
    try {
      const result = await updateProfile(updates); // { message, user }
      return result.user; // trả về user mới
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || 'Update profile failed');
    }
  }
);

// Gửi OTP cho đăng ký
export const requestOtpThunk = createAsyncThunk(
  'auth/requestOtp',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const res = await requestOtp(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || 'Request OTP failed');
    }
  }
);

// Xác thực OTP cho đăng ký
export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (data: RegisterData & { otp: string }, { rejectWithValue }) => {
    try {
      const res = await verifyOtp(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || 'Verify OTP failed');
    }
  }
);

export const updateAvatarThunk = createAsyncThunk<
  UserProfile,
  File,
  { rejectValue: string }
>('auth/updateAvatar', async (file, { rejectWithValue }) => {
  try {
    const res = await updateAvatar(file);
    return res.user;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || 'Upload avatar failed'
    );
  }
});

export const updateCoverPhotoThunk = createAsyncThunk<
  UserProfile,
  File,
  { rejectValue: string }
>('auth/updateCoverPhoto', async (file, { rejectWithValue }) => {
  try {
    const res = await updateCoverPhoto(file);
    return res.user;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || 'Upload cover photo failed'
    );
  }
});

type AuthState = {
  user: any;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: any;
};

// 👉 Lấy accessToken từ localStorage khi app load lại
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      // 👉 clear token khi logout
      localStorage.removeItem('accessToken');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.accessToken = a.payload.accessToken;
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // Fetch profile cases
      .addCase(fetchProfile.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // Request OTP cases
      .addCase(requestOtpThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(requestOtpThunk.fulfilled, (s) => {
        s.loading = false;
        s.error = null;
      })
      .addCase(requestOtpThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // Verify OTP cases
      .addCase(verifyOtpThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (s) => {
        s.loading = false;
        s.error = null;
      })
      .addCase(verifyOtpThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // update profile 👇
      .addCase(updateProfileThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload; // cập nhật user mới
      })
      .addCase(updateProfileThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(updateAvatarThunk.fulfilled, (state, action) => {
        state.user = {
          ...(state.user || {}), // đảm bảo luôn là object
          ...(action.payload || {}), // merge payload nếu có
        };
      })

      .addCase(updateCoverPhotoThunk.fulfilled, (state, action) => {
        state.user = {
          ...(state.user || {}), // tránh undefined
          ...(action.payload || {}), // merge payload nếu có
        };
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
