import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchInitialLocation = createAsyncThunk(
  "location/fetchInitialLocation",
  async (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(
          rejectWithValue("Geolocation is not supported by your browser")
        );
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = { lat: latitude, lng: longitude };

          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
            const res = await axios.get(url);
            const exactAddress = res.data.display_name;
            resolve({ userCoords, address: exactAddress });
          } catch (error) {
            // console.error("Error finding address:", error);
            resolve({
              userCoords,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            });
          }
        },
        (error) => {
          // console.error("Location denied or error:", error);
          const defaultCoords = { lat: 12.9716, lng: 77.5946 };
          const defaultAddress = "Bengaluru, India";
          // We resolve with default location instead of rejecting,
          // so the app can proceed with a default location.
          resolve({
            userCoords: defaultCoords,
            address: defaultAddress,
            error: "Could not detect location. Defaulted to Bengaluru, India.",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState: {
    initialLocation: null,
    initialAddress: null,
    loading: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialLocation.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchInitialLocation.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.initialLocation = action.payload.userCoords;
        state.initialAddress = action.payload.address;
        if (action.payload.error) {
          // Store the non-fatal error message to be shown as a notification if needed
          state.error = action.payload.error;
        }
      })
      .addCase(fetchInitialLocation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload;
      });
  },
});

export default locationSlice.reducer;
