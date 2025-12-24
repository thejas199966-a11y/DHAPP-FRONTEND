import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch drivers from your Python backend
export const fetchDrivers = createAsyncThunk(
  "drivers/fetchDrivers",
  async () => {
    // Assuming backend runs on port 8000
    const response = await axios.get("http://127.0.0.1:8000/drivers/");
    return response?.data || [];
  }
);

const driverSlice = createSlice({
  name: "drivers",
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default driverSlice.reducer;
