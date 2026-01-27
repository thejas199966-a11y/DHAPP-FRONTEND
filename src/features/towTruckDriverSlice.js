import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch Profile
export const fetchTowDriverProfile = createAsyncThunk(
  "towTruckDrivers/fetchProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(
        `${API_BASE_URL}/tow-truck-drivers/me`,
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch profile",
      );
    }
  },
);

// Update Profile
export const updateTowDriverProfile = createAsyncThunk(
  "towTruckDrivers/updateProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.patch(
        `${API_BASE_URL}/tow-truck-drivers/me`,
        profileData,
        config,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to update profile",
      );
    }
  },
);

// Upload Profile Picture
export const uploadTowDriverProfilePicture = createAsyncThunk(
  "towTruckDrivers/uploadProfilePicture",
  async (imageBlob, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const formData = new FormData();
      // Convert blob/url to file if necessary, handling base64 is handled in UI usually,
      // but assuming the component passes a blob or we fetch it.
      // For simplicity matching existing logic, assuming blob/file passed directly
      const response = await fetch(imageBlob);
      const blob = await response.blob();
      formData.append("file", blob, "profile.jpg");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      const apiResponse = await axios.put(
        `${API_BASE_URL}/tow-truck-drivers/me/profile-picture`,
        formData,
        config,
      );
      return apiResponse.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to upload picture",
      );
    }
  },
);

const towTruckDriverSlice = createSlice({
  name: "towTruckDrivers",
  initialState: {
    profile: null,
    profileStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTowDriverProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(fetchTowDriverProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchTowDriverProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateTowDriverProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      // Upload Picture
      .addCase(uploadTowDriverProfilePicture.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export default towTruckDriverSlice.reducer;
