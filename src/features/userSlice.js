import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    tripData: {},
  },
  reducers: {
    setTripData: (state, action) => {
      state.tripData = action.payload;
    },
  },
});

export const { setTripData } = userSlice.actions;
export default userSlice.reducer;
