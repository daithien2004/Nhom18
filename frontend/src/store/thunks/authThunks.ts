import {
  login,
  getMe,
  requestOtp,
  verifyOtp,
  updateProfile,
  updateAvatar,
  updateCoverPhoto,
} from '../../services/authService';
import type { RegisterData } from '../../types/auth';
import type { UserProfile } from '../../types/user';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { handleApi } from '../../utils/apiClient';

// Login thunk
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (dto: { email: string; password: string }, { rejectWithValue }) => {
    const result = await handleApi(
      () => login(dto.email, dto.password),
      rejectWithValue,
      'Login failed'
    );

    localStorage.setItem('accessToken', result.accessToken);
    return result;
  }
);

// Fetch profile thunk
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    return handleApi(() => getMe(), rejectWithValue, 'Fetch profile failed');
  }
);

// Update profile thunk
export const updateProfileThunk = createAsyncThunk(
  'users/update-profile',
  async (
    updates: Partial<
      Pick<UserProfile, 'phone' | 'gender' | 'birthday' | 'bio'>
    >,
    { rejectWithValue }
  ) => {
    const res = await handleApi(
      () => updateProfile(updates),
      rejectWithValue,
      'Update profile failed'
    );
    return res.user;
  }
);

// Request OTP thunk
export const requestOtpThunk = createAsyncThunk(
  'auth/requestOtp',
  async (data: RegisterData, { rejectWithValue }) => {
    return handleApi(
      () => requestOtp(data),
      rejectWithValue,
      'Request OTP failed'
    );
  }
);

// Verify OTP thunk
export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (data: RegisterData & { otp: string }, { rejectWithValue }) => {
    return handleApi(
      () => verifyOtp(data),
      rejectWithValue,
      'Verify OTP failed'
    );
  }
);

// Update avatar thunk
export const updateAvatarThunk = createAsyncThunk<
  UserProfile,
  File,
  { rejectValue: string }
>('auth/updateAvatar', async (file, { rejectWithValue }) => {
  const res = await handleApi(
    () => updateAvatar(file),
    rejectWithValue,
    'Upload avatar failed'
  );
  return res.user;
});

// Update cover photo thunk
export const updateCoverPhotoThunk = createAsyncThunk<
  UserProfile,
  File,
  { rejectValue: string }
>('auth/updateCoverPhoto', async (file, { rejectWithValue }) => {
  const res = await handleApi(
    () => updateCoverPhoto(file),
    rejectWithValue,
    'Upload cover photo failed'
  );
  return res.user;
});
