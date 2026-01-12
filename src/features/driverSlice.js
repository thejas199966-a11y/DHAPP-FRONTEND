import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth token from state
const getToken = (thunkAPI) => {
  return thunkAPI.getState().auth.token;
};

// --- Async Thunks ---

export const fetchDrivers = createAsyncThunk(
  "drivers/fetchDrivers",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/drivers/`);
    return response?.data || [];
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().drivers;
      if (status === "loading") {
        return false;
      }
      return true;
    },
  }
);

export const fetchDriverById = createAsyncThunk(
  "drivers/fetchDriverById",
  async (driverId) => {
    const response = await axios.get(`${API_BASE_URL}/drivers/${driverId}`);
    return response.data;
  }
);

export const fetchDriverProfile = createAsyncThunk(
  "drivers/fetchDriverProfile",
  async (_, thunkAPI) => {
    const token = getToken(thunkAPI);
    const response = await axios.get(`${API_BASE_URL}/drivers/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const updateDriverProfile = createAsyncThunk(
  "drivers/updateDriverProfile",
  async (updateData, thunkAPI) => {
    const token = getToken(thunkAPI);
    const response = await axios.patch(
      `${API_BASE_URL}/drivers/me`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }
);

export const fetchDriverReviews = createAsyncThunk(
  "drivers/fetchDriverReviews",
  async ({ driverId, page, limit = 5 }) => {
    const response = await axios.get(
      `${API_BASE_URL}/drivers/${driverId}/reviews?page=${page}&limit=${limit}`
    );
    return { data: response.data, page };
  }
);

const driverSlice = createSlice({
  name: "drivers",
  initialState: {
    list: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,

    // State for single driver public detail page
    details: null,
    detailsStatus: "idle",

    // State for driver's own profile
    profile: null,
    profileStatus: "idle",

    // State for reviews on detail page
    reviews: [],
    reviewsStatus: "idle",
    reviewsPage: 1,
    hasMoreReviews: true,
  },
  reducers: {
    resetDriverDetails: (state) => {
      state.details = null;
      state.detailsStatus = "idle";
      state.reviews = [];
      state.reviewsStatus = "idle";
      state.reviewsPage = 1;
      state.hasMoreReviews = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDrivers
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
      })
      // fetchDriverById
      .addCase(fetchDriverById.pending, (state) => {
        state.detailsStatus = "loading";
      })
      .addCase(fetchDriverById.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.details = action.payload;
      })
      .addCase(fetchDriverById.rejected, (state) => {
        state.detailsStatus = "failed";
      })
      // fetchDriverProfile
      .addCase(fetchDriverProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(fetchDriverProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchDriverProfile.rejected, (state) => {
        state.profileStatus = "failed";
      })
      // updateDriverProfile
      .addCase(updateDriverProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(updateDriverProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
      })
      .addCase(updateDriverProfile.rejected, (state) => {
        state.profileStatus = "failed";
      })
      // fetchDriverReviews
      .addCase(fetchDriverReviews.pending, (state) => {
        state.reviewsStatus = "loading";
      })
      .addCase(fetchDriverReviews.fulfilled, (state, action) => {
        state.reviewsStatus = "succeeded";
        if (action.payload.page === 1) {
          state.reviews = action.payload.data;
        } else {
          state.reviews.push(...action.payload.data);
        }
        state.reviewsPage = action.payload.page;
        state.hasMoreReviews = action.payload.data.length > 0;
      })
      .addCase(fetchDriverReviews.rejected, (state) => {
        state.reviewsStatus = "failed";
      });
  },
});

export const { resetDriverDetails } = driverSlice.actions;

export default driverSlice.reducer;
