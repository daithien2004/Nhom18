// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  login,
  getMe,
  requestOtp,
  verifyOtp,
} from '../../services/authService';
import type { RegisterData } from '../../types/auth';

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

// Gửi OTP
export const requestOtpThunk = createAsyncThunk(
  '/auth/register/request-otp',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const res = await requestOtp(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || 'Request OTP failed');
    }
  }
);

// Xác thực OTP
export const verifyOtpThunk = createAsyncThunk(
  '/auth/register/verify',
  async (data: RegisterData & { otp: string }, { rejectWithValue }) => {
    try {
      const res = await verifyOtp(data);
      return res;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || 'Verify OTP failed');
    }
  }
);

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
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
