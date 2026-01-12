import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Mock data until the API is ready
const mockTrips = [
  { id: 1, source: 'Bangalore', destination: 'Mysore', date: '2026-01-15', price: 2500, vehicle_type: 'SEDAN', driver_name: 'Ramesh Kumar', driver_rating: 4.8, available_seats: 3, status: 'available' },
  { id: 2, source: 'Bangalore', destination: 'Chennai', date: '2026-01-16', price: 6000, vehicle_type: 'SUV', driver_name: 'Suresh Gowda', driver_rating: 4.9, available_seats: 4, status: 'available' },
  { id: 3, source: 'Mumbai', destination: 'Pune', date: '2026-01-15', price: 3000, vehicle_type: 'HATCHBACK', driver_name: 'Anil Chavan', driver_rating: 4.7, available_seats: 2, status: 'full' },
  { id: 4, source: 'Delhi', destination: 'Agra', date: '2026-01-18', price: 4500, vehicle_type: 'LUXURY', driver_name: 'Vikram Singh', driver_rating: 5.0, available_seats: 3, status: 'available' },
  { id: 5, source: 'Bangalore', destination: 'Hyderabad', date: '2026-01-20', price: 7000, vehicle_type: 'SUV', driver_name: 'Prakash Reddy', driver_rating: 4.6, available_seats: 5, status: 'available' },
  { id: 6, source: 'Kolkata', destination: 'Durgapur', date: '2026-01-17', price: 3500, vehicle_type: 'SEDAN', driver_name: 'Mithun Chakraborty', driver_rating: 4.8, available_seats: 1, status: 'available' },
  { id: 7, source: 'Jaipur', destination: 'Udaipur', date: '2026-01-19', price: 4000, vehicle_type: 'TEMPO', driver_name: 'Gopal Verma', driver_rating: 4.5, available_seats: 9, status: 'available' },
  { id: 8, source: 'Chennai', destination: 'Pondicherry', date: '2026-01-21', price: 2800, vehicle_type: 'MINIBUS', driver_name: 'Karthik Raja', driver_rating: 4.7, available_seats: 12, status: 'available' },
  { id: 9, source: 'Ahmedabad', destination: 'Surat', date: '2026-01-22', price: 3200, vehicle_type: 'BUS', driver_name: 'Jignesh Patel', driver_rating: 4.6, available_seats: 30, status: 'available' },
];

// Async thunk to fetch trips
export const fetchTrips = createAsyncThunk(
  "trips/fetchTrips",
  async () => {
    // This is a mock implementation.
    // In the future, you would replace this with a real API call.
    // For example:
    // const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/trips/`);
    // return response?.data || [];

    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTrips);
      }, 1500);
    });
  }
);

const travelSlice = createSlice({
  name: "travels",
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default travelSlice.reducer;
