
import { createSlice } from "@reduxjs/toolkit";

const savedToken = localStorage.getItem("token");

const initialState = {
  user: null,
  token: savedToken,
  isAuthenticated: Boolean(savedToken),
  isLoading: Boolean(savedToken),
  error: null,
  sessionError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = Boolean(action.payload.token);
      state.sessionError = null;

      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    },

    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    registerSuccess: (state) => {
      state.error = null;
      state.isLoading = false;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.token);
      state.isLoading = false;
      state.error = null;
      state.sessionError = null;
    },

    sessionRestoreFailure: (state, action) => {
      state.isLoading = false;
      state.sessionError = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.sessionError = null;

      localStorage.removeItem("token");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerSuccess,
  setUser,
  sessionRestoreFailure,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
