import { createSlice } from "@reduxjs/toolkit";

// Check if token exists in browser on start
const token = localStorage.getItem("token");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: token ? true : null, // Simple check if logged in
    token: token || null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = true;
      state.token = action.payload;
      localStorage.setItem("token", action.payload); // Save to browser
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token"); // Clear from browser
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
