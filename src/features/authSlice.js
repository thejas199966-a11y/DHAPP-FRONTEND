import { createSlice } from "@reduxjs/toolkit";

// Cookie helper functions
const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
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
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
