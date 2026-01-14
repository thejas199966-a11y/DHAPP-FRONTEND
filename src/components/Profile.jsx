import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  TextField,
  Grid,
  Button,
  Typography,
  Skeleton,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Modal,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import {
  fetchDriverProfile,
  updateDriverProfile,
  uploadDriverProfilePicture,
} from "../features/driverSlice";
import {
  fetchUserProfile,
  updateUserProfile,
  uploadUserProfilePicture,
} from "../features/userSlice";
import { showNotification } from "../features/notificationSlice";
import ImageCropper from "./ImageCropper";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const role = authUser?.role;

  // Selectors based on role
  const driverState = useSelector((state) => state.drivers);
  const userState = useSelector((state) => state.user);

  const profileData =
    role === "driver" ? driverState.profile : userState.profile;
  const status =
    role === "driver" ? driverState.profileStatus : userState.profileStatus;

  const [formData, setFormData] = useState({});
  const [isEdited, setIsEdited] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [pfp, setPfp] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    if (role === "driver") {
      dispatch(fetchDriverProfile());
    } else {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, role]);

  // Populate local form state when data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
      setPfp(profileData?.profile_picture_url || profileData?.avatar_url);
    }
  }, [profileData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsEdited(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };

  const handleCrop = async (croppedImageUrl) => {
    setCropperOpen(false);
    try {
      if (role === "driver") {
        await dispatch(uploadDriverProfilePicture(croppedImageUrl)).unwrap();
      } else {
        await dispatch(uploadUserProfilePicture(croppedImageUrl)).unwrap();
      }
      dispatch(
        showNotification({
          message: "Profile picture updated successfully!",
          severity: "success",
        })
      );
    } catch (error) {
      dispatch(
        showNotification({
          message: "Failed to upload profile picture.",
          severity: "error",
        })
      );
    }
  };

  const handleSave = async () => {
    try {
      if (role === "driver") {
        await dispatch(updateDriverProfile(formData)).unwrap();
      } else {
        await dispatch(updateUserProfile(formData)).unwrap();
      }
      dispatch(
        showNotification({
          message: "Profile updated successfully!",
          severity: "success",
        })
      );
      setIsEdited(false);
      onClose();
    } catch (error) {
      dispatch(
        showNotification({
          message: "Failed to update profile",
          severity: "error",
        })
      );
    }
  };

  if (status === "loading" || status === "idle") {
    return (
      <Box sx={{ p: 1 }}>
        {/* Title Skeleton */}
        <Typography variant="h5" sx={{ mb: 3 }}>
          <Skeleton
            width={180}
            height={32}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
          />
        </Typography>

        <Grid container spacing={2}>
          {role === "user" ? (
            /* --- User Role Skeleton --- */
            <>
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>
            </>
          ) : (
            /* --- Driver Role Skeleton --- */
            <>
              {/* Row 1: Name & Phone */}
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>

              {/* Row 2: Emergency Phone & Spacer/Field */}
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>

              {/* Row 3: Address (Full Width) */}
              <Grid item xs={12}>
                <Skeleton
                  variant="rectangular"
                  height={80}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>

              {/* Row 4: Experience & Vehicle */}
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>

              {/* Row 5: Fare & Allowance */}
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>

              {/* Row 6: Languages & License */}
              <Grid item xs={12}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>
              <Grid item xs={12}>
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.08)" }}
                />
              </Grid>
            </>
          )}
        </Grid>

        {/* Save Button Skeleton */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Skeleton
            variant="rectangular"
            width={140}
            height={40}
            sx={{ borderRadius: 1, bgcolor: "rgba(255, 255, 255, 0.15)" }}
          />
        </Box>
      </Box>
    );
  }

  if (status === "failed") {
    return <Alert severity="error">Failed to load profile data.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {role === "driver" ? "Driver Profile" : "User Profile"}
      </Typography>

      <Grid container spacing={2} display={"flex"} flexDirection={"column"}>
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "center", mb: 2 }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={`${API_BASE_URL}${pfp}`}
              sx={{ width: 120, height: 120 }}
            >
              {/* Fallback to first letter of name */}
              {formData.name ? formData.name.charAt(0) : ""}
            </Avatar>
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              }}
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
            >
              <PhotoCamera />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileSelect}
            />
          </Box>
        </Grid>

        {/* --- Common Field(s) --- */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={role === "driver" ? "Name" : "Full Name"}
            name={role === "driver" ? "name" : "full_name"}
            value={
              role === "driver" ? formData.name || "" : formData.full_name || ""
            }
            onChange={handleChange}
            variant="filled"
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#ccc" } }}
            sx={{
              "& .MuiFilledInput-root::after": {
                borderBottomColor: "white",
              },
            }}
          />
        </Grid>

        {/* --- Driver Specific Fields --- */}
        {role === "driver" && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number || ""}
                onChange={handleChange}
                variant="filled"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Phone"
                name="emergency_phone"
                value={formData.emergency_phone || ""}
                onChange={handleChange}
                variant="filled"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                variant="filled"
                multiline
                rows={2}
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="years_of_experience"
                type="number"
                value={formData.years_of_experience || ""}
                onChange={handleChange}
                variant="filled"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Vehicle Type"
                name="vehicle_type"
                value={formData.vehicle_type || ""}
                onChange={handleChange}
                variant="filled"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              >
                <MenuItem value="Sedan">Sedan</MenuItem>
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Hatchback">Hatchback</MenuItem>
                <MenuItem value="Luxury">Luxury</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fare per KM"
                name="fare_per_km"
                type="number"
                value={formData.fare_per_km || ""}
                onChange={handleChange}
                variant="filled"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Allowance"
                name="driver_allowance"
                type="number"
                value={formData.driver_allowance || ""}
                onChange={handleChange}
                variant="filled"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Spoken Languages (comma separated)"
                name="spoken_languages"
                value={formData.spoken_languages || ""}
                onChange={handleChange}
                variant="filled"
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="License Number"
                value={formData.license_number || ""}
                disabled
                variant="filled"
                InputProps={{ style: { color: "#777" } }}
                InputLabelProps={{ style: { color: "#ccc" } }}
                helperText="License number cannot be changed"
                sx={{
                  "& .MuiFilledInput-root::after": {
                    borderBottomColor: "white",
                  },
                }}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isEdited || status === "loading"}
          sx={{
            backgroundColor: "#1d1e1e",
            color: "white",
            "&:hover": {
              backgroundColor: "#080808",
            },
          }}
        >
          {status === "loading" ? (
            <CircularProgress size={24} />
          ) : (
            "Save Changes"
          )}
        </Button>
      </Box>

      <Modal open={cropperOpen} onClose={() => setCropperOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedImage && (
            <ImageCropper
              imageSrc={selectedImage}
              onCrop={handleCrop}
              onClose={() => setCropperOpen(false)}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile;
