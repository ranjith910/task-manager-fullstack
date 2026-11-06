import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import activityService from "../../services/activityService";
import { createApiThunk } from "../createApiThunk";
import { logout, sessionExpired } from "./authSlice";

export const fetchActivity = createApiThunk("activity/fetchActivity", (limit, signal) =>
  activityService.getActivity(limit, signal),
);

const initialState = { items: [], status: "idle", error: null, requestId: null };

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivity.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchActivity.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchActivity.rejected, (state, action) => {
        if (action.meta.aborted || state.requestId !== action.meta.requestId) return;
        state.status = "failed";
        state.error = action.payload?.message || "Something went wrong";
      })
      .addMatcher(isAnyOf(logout.fulfilled, logout.rejected, sessionExpired), () => initialState);
  },
});

export default activitySlice.reducer;
