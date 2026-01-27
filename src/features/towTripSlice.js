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

export const fetchTowDriverOffers = createAsyncThunk(
  "towTrips/fetchOffers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `${API_BASE_URL}/tow-trips/driver/offers`,
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch offers");
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

export const acceptTowTripOffer = createAsyncThunk(
  "towTrips/acceptOffer",
  async (offerId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_BASE_URL}/tow-trips/driver/accept-offer/${offerId}`,
        {},
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to accept offer");
    }
  },
);

export const rejectTowTripOffer = createAsyncThunk(
  "towTrips/rejectOffer",
  async (offerId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_BASE_URL}/tow-trips/driver/reject-offer/${offerId}`,
        {},
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to reject offer");
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
      .addCase(fetchTowDriverOffers.fulfilled, (state, action) => {
        state.offers = action.payload;
      })
      .addCase(fetchMyTowBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })
      .addCase(acceptTowTripOffer.fulfilled, (state, action) => {
        state.offers = state.offers.filter((o) => o.id !== action.meta.arg);
      })
      .addCase(rejectTowTripOffer.fulfilled, (state, action) => {
        state.offers = state.offers.filter((o) => o.id !== action.meta.arg);
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
