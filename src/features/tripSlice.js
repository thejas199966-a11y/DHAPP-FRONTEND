import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get config
const getAuthConfig = (getState) => {
  const token = getState().auth.token;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create a user Request
export const createTrip = createAsyncThunk(
  "trips/createTrip",
  async (tripData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trips/book-request`,
        tripData,
        getAuthConfig(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// Fetch My Bookings (User: History/Active, Driver: Assigned Trips)
export const fetchMyBookings = createAsyncThunk(
  "trips/fetchMyBookings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/trips/my-bookings`,
        getAuthConfig(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// Cancel Trip (User Side)
export const cancelTrip = createAsyncThunk(
  "trips/cancelTrip",
  async (tripId, { getState, rejectWithValue }) => {
    try {
      await axios.post(
        `${API_BASE_URL}/trips/${tripId}/cancel`,
        {},
        getAuthConfig(getState),
      );
      return tripId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to cancel trip");
    }
  },
);

export const updateTripStatus = createAsyncThunk(
  "trips/updateTripStatus",
  async ({ tripId, status }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/trips/${tripId}`,
        { status },
        getAuthConfig(getState),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const tripSlice = createSlice({
  name: "trips",
  initialState: {
    bookings: [], // Confirmed/Active trips for User or Driver
    offers: [], // Pending requests for Driver
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch My Bookings
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create Trip
      .addCase(createTrip.fulfilled, (state, action) => {
        // Add the new active trip to the top of the list
        state.bookings.unshift(action.payload);
      })
      // Cancel Trip
      .addCase(cancelTrip.fulfilled, (state, action) => {
        // Update the status of the cancelled trip in the local state
        const index = state.bookings.findIndex((t) => t.id === action.payload);
        if (index !== -1) {
          state.bookings[index].status = "cancelled";
        }
      });
  },
});

export default tripSlice.reducer;
