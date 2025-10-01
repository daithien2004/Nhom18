import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import postReducer from './slices/postSlice';
import conversationReducer from '../store/slices/conversationSlice';
import friendReducer from '../store/slices/friendSlice';
import friendSearchReducer from '../store/slices/friendSearchSlice';
import friendListSearchReducer from '../store/slices/friendListSearchSlice';
import notidicationReducer from '../store/slices/notificationSlice';
import storage from 'redux-persist/lib/storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// Config persist cho từng reducer (hoặc toàn bộ)
const persistConfig = {
  key: 'root', // key để lưu trong localStorage
  storage,
  blacklist: ['notifications', 'friendSearch'], // Không persist những slice tạm thời, tránh lưu dữ liệu nhạy cảm
};

// Gộp các reducer lại thành 1 rootReducer
const rootReducer = combineReducers({
  auth: authReducer,
  posts: postReducer,
  conversations: conversationReducer,
  friends: friendReducer,
  friendSearch: friendSearchReducer,
  friendListSearch: friendListSearchReducer,
  notifications: notidicationReducer,
});

// Wrap rootReducer với persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store); // Tạo persistor để dùng ở App

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
