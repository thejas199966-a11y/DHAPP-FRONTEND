import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoginModalOpen: false,
};

const authModalSlice = createSlice({
  name: "authModal",
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
  },
});

export const { openLoginModal, closeLoginModal } = authModalSlice.actions;

export default authModalSlice.reducer;
