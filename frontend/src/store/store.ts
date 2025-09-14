import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import postReducer from '../store/slices/postSlice';
import messageReducer from '../store/slices/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    messages: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
