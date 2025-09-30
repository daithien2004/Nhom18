import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";
import postReducer from "./slices/postSlice";
import conversationReducer from "../store/slices/conversationSlice";
import friendReducer from "../store/slices/friendSlice";
import friendSearchReducer from "../store/slices/friendSearchSlice";
import friendListSearchReducer from "../store/slices/friendListSearchSlice";
import notidicationReducer from "../store/slices/notificationSlice";
// ⭐️ import activities reducer
import activitiesReducer from "../store/slices/activitySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    conversations: conversationReducer,
    friends: friendReducer,
    friendSearch: friendSearchReducer,
    friendListSearch: friendListSearchReducer,
    notifications: notidicationReducer,
    activities: activitiesReducer, // <- key: activities
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
