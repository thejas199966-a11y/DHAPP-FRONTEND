import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for email verification
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/verify-email`,
        { email }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Cookie helper functions
const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Check if token exists in cookies on start
const token = getCookie("token");
const userData = getCookie("user");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: token && userData ? JSON.parse(userData) : null,
    token: token || null,
    emailVerificationStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    emailVerificationError: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      setCookie("token", action.payload.token, 2);
      setCookie("user", JSON.stringify(action.payload.user), 2);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      deleteCookie("token");
      deleteCookie("user");
    },
    resetEmailVerification: (state) => {
      state.emailVerificationStatus = "idle";
      state.emailVerificationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.emailVerificationStatus = "loading";
        state.emailVerificationError = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.emailVerificationStatus = "succeeded";
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.emailVerificationStatus = "failed";
        const detail = action.payload?.detail;
        if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
          state.emailVerificationError = detail[0].msg;
        } else if (typeof detail === "string") {
          state.emailVerificationError = detail;
        } else {
          state.emailVerificationError = "Invalid email or server error";
        }
      });
  },
});

export const { loginSuccess, logout, resetEmailVerification } =
  authSlice.actions;
export default authSlice.reducer;
