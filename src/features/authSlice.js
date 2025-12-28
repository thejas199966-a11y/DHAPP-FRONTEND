import { createSlice } from "@reduxjs/toolkit";

// Check if token exists in browser on start
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

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
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
