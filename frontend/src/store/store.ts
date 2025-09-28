import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";
import postReducer from "./slices/postSlice";
import conversationReducer from "../store/slices/conversationSlice";
import friendReducer from "../store/slices/friendSlice";
import friendSearchReducer from "../store/slices/friendSearchSlice";
import friendListSearchReducer from "../store/slices/friendListSearchSlice";
import activityReducer from "../store/slices/activitySlice";

// Load activity state from localStorage (if available)
let preloadedState: any = undefined;
try {
  const raw =
    typeof window !== "undefined"
      ? localStorage.getItem("activityState")
      : null;
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      preloadedState = { activity: parsed };
    }
  }
} catch {
  // ignore parse errors
}

const reducers = {
  auth: authReducer,
  posts: postReducer,
  conversations: conversationReducer,
  friends: friendReducer,
  friendSearch: friendSearchReducer,
  friendListSearch: friendListSearchReducer,
  activity: activityReducer,
};

export const store = configureStore({
  reducer: reducers as any,
  preloadedState: preloadedState as any,
});

// Persist activity state to localStorage on changes
try {
  if (typeof window !== "undefined") {
    store.subscribe(() => {
      const state = store.getState();
      try {
        localStorage.setItem("activityState", JSON.stringify(state.activity));
      } catch {
        // ignore quota or serialization errors
      }
    });
  }
} catch {
  // ignore
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
