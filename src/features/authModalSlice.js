import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoginModalOpen: false,
  initialView: "login", // can be 'login' or 'signup'
};

const authModalSlice = createSlice({
  name: "authModal",
  initialState,
  reducers: {
    openLoginModal: (state, action) => {
      state.isLoginModalOpen = true;
      state.initialView = action.payload?.initialView || "login";
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
  },
});

export const { openLoginModal, closeLoginModal } = authModalSlice.actions;

export default authModalSlice.reducer;
