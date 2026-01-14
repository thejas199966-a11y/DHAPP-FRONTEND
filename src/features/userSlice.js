import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = (thunkAPI) => {
  return thunkAPI.getState().auth.token;
};

// Helper to convert base64 to a Blob
const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, thunkAPI) => {
    const token = getToken(thunkAPI);
    const response = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (updateData, thunkAPI) => {
    const token = getToken(thunkAPI);
    const response = await axios.patch(`${API_BASE_URL}/users/me`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const uploadUserProfilePicture = createAsyncThunk(
  "user/uploadUserProfilePicture",
  async (croppedImage, thunkAPI) => {
    const token = getToken(thunkAPI);
    const blob = dataURLtoBlob(croppedImage);
    const formData = new FormData();
    formData.append("file", blob, "profile.png");

    const response = await axios.put(`${API_BASE_URL}/users/me/profile-picture`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    tripData: {},
    profile: null,
    profileStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    setTripData: (state, action) => {
      state.tripData = action.payload;
    },
    clearUserProfile: (state) => {
      state.profile = null;
      state.profileStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.error.message;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.error.message;
      })
      // Upload Profile Picture
      .addCase(uploadUserProfilePicture.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(uploadUserProfilePicture.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(uploadUserProfilePicture.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setTripData, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
