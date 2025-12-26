import { createSlice } from "@reduxjs/toolkit";

const commonSlice = createSlice({
  name: "common",
  initialState: {
    location: {
      city: "Detecting...", // Default state
      state: "",
      coordinates: null,
      isManual: false, // To know if user manually changed it
    },
    // You can add other app-wide settings here later (e.g., theme mode)
  },
  reducers: {
    setLocation: (state, action) => {
      state.location = {
        city: action.payload.city,
        state: action.payload.state || "",
        coordinates: action.payload.coordinates || null,
        isManual: action.payload.isManual || false,
      };
    },
    setLoadingLocation: (state) => {
      state.location.city = "Locating...";
    },
  },
});

export const { setLocation, setLoadingLocation } = commonSlice.actions;
export default commonSlice.reducer;
