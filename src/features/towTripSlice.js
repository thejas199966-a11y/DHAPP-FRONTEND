import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create Booking
export const createTowTrip = createAsyncThunk(
  "towTrips/createTrip",
  async (tripData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_BASE_URL}/tow-trips/book-request`,
        tripData,
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Booking failed");
    }
  },
);

// Cancel Booking - NEW
export const cancelTowTrip = createAsyncThunk(
  "towTrips/cancelTrip",
  async (tripId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_BASE_URL}/tow-trips/${tripId}/cancel`,
        {},
        config,
      );
      return { tripId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Cancellation failed");
    }
  },
);

export const fetchMyTowBookings = createAsyncThunk(
  "towTrips/fetchMyBookings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `${API_BASE_URL}/tow-trips/my-bookings`,
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch bookings",
      );
    }
  },
);

const towTripSlice = createSlice({
  name: "towTrips",
  initialState: {
    offers: [],
    bookings: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTowBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })
      // Handle Cancel Trip
      .addCase(cancelTowTrip.fulfilled, (state, action) => {
        // Update the booking in the list to 'cancelled'
        const index = state.bookings.findIndex(
          (b) => b.id === action.payload.tripId,
        );
        if (index !== -1) {
          state.bookings[index].status = "cancelled";
        }
      });
  },
});

export default towTripSlice.reducer;
