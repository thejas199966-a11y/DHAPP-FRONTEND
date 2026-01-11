import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk to create a new trip (booking)
export const createTrip = createAsyncThunk(
  "trips/createTrip",
  async (tripData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue("No auth token found");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${API_BASE_URL}/trips/`,
        tripData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to fetch bookings for the current driver
export const fetchDriverBookings = createAsyncThunk(
  "trips/fetchDriverBookings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue("No auth token found");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API_BASE_URL}/trips/my-bookings`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to update the status of a trip
export const updateTripStatus = createAsyncThunk(
  "trips/updateTripStatus",
  async ({ tripId, status }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue("No auth token found");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${API_BASE_URL}/trips/${tripId}`,
        { status },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const tripSlice = createSlice({
  name: "trips",
  initialState: {
    bookings: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Trip
      .addCase(createTrip.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bookings.push(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch Driver Bookings
      .addCase(fetchDriverBookings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDriverBookings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bookings = action.payload;
      })
      .addCase(fetchDriverBookings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update Trip Status
      .addCase(updateTripStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateTripStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.bookings.findIndex(
          (booking) => booking.id === action.payload.id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateTripStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default tripSlice.reducer;
