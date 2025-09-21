import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";
import postDetailReducer from "./slices/postDetailSlice";
import messageReducer from "../store/slices/messageSlice";
import friendReducer from "../store/slices/friendSlice";
import friendSearchReducer from "../store/slices/friendSearchSlice";
import friendListSearchReducer from "../store/slices/friendListSearchSlice";
import postsReducer from "../store/slices/postsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    postDetail: postDetailReducer,
    messages: messageReducer,
    friends: friendReducer,
    friendSearch: friendSearchReducer,
    friendListSearch: friendListSearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
