import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import { createApiThunk } from "../createApiThunk";

export const fetchCurrentUser = createApiThunk("auth/fetchCurrentUser", () => authService.getMe());
export const login = createApiThunk("auth/login", (credentials) => authService.login(credentials));
export const register = createApiThunk("auth/register", (details) => authService.register(details));
export const logout = createApiThunk("auth/logout", () => authService.logout());
export const updateProfile = createApiThunk("auth/updateProfile", (changes) =>
  authService.updateProfile(changes),
);
export const changePassword = createApiThunk("auth/changePassword", (passwords) =>
  authService.changePassword(passwords),
);

const initialState = {
  user: null,
  // false until we know whether the cookie is still valid
  initialized: false,
  // set when that check failed for a reason other than "not logged in" (server down, timeout)
  sessionError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.sessionError = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        // only a 401 means "logged out"; anything else we can't tell yet
        if (action.payload?.status === 401) {
          state.user = null;
          state.initialized = true;
        } else {
          state.sessionError = action.payload?.message || "Can't reach the server";
        }
      })
      .addMatcher(
        isAnyOf(login.fulfilled, register.fulfilled, updateProfile.fulfilled),
        (state, action) => {
          state.user = action.payload;
        },
      )
      // even if the request fails we drop the user locally
      .addMatcher(isAnyOf(logout.fulfilled, logout.rejected), (state) => {
        state.user = null;
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export default authSlice.reducer;
