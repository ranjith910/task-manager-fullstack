import { combineReducers, configureStore } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import authReducer, { sessionExpired } from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import activityReducer from "./slices/activitySlice";
import { setUnauthorizedHandler } from "../services/api";

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  activity: activityReducer,
});

// a factory so tests can create a fresh store with their own state
export const setupStore = (preloadedState) =>
  configureStore({ reducer: rootReducer, preloadedState });

export const store = setupStore();

setUnauthorizedHandler(() => {
  if (!store.getState().auth.user) return;
  store.dispatch(sessionExpired());
  toast.error("Your session has expired, please log in again");
});
