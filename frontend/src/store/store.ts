import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import postReducer from '../store/slices/postSlice';
import conversationReducer from '../store/slices/conversationSlice';
import friendReducer from '../store/slices/friendSlice';
import friendSearchReducer from '../store/slices/friendSearchSlice';
import friendListSearchReducer from '../store/slices/friendListSearchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    conversations: conversationReducer,
    friends: friendReducer,
    friendSearch: friendSearchReducer,
    friendListSearch: friendListSearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
