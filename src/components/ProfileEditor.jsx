import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { updateDriverProfile } from "../features/driverSlice";
import { showNotification } from "../features/notificationSlice";

const ProfileEditor = ({ profile, status }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone_number: "",
    emergency_phone: "",
    years_of_experience: "",
    vehicle_type: "",
    fare_per_km: "",
    driver_allowance: "",
    spoken_languages: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        address: profile.address || "",
        phone_number: profile.phone_number || "",
        emergency_phone: profile.emergency_phone || "",
        years_of_experience: profile.years_of_experience || "",
        vehicle_type: profile.vehicle_type || "",
        fare_per_km: profile.fare_per_km || "",
        driver_allowance: profile.driver_allowance || "",
        spoken_languages: profile.spoken_languages || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {};
    // Only include fields that have changed
    for (const key in formData) {
      if (formData[key] !== profile[key]) {
        updatedData[key] = formData[key];
      }
    }

    if (Object.keys(updatedData).length > 0) {
      dispatch(updateDriverProfile(updatedData))
        .unwrap()
        .then(() => {
          dispatch(
            showNotification({
              message: "Profile updated successfully!",
              severity: "success",
            })
          );
        })
        .catch((err) => {
          dispatch(
            showNotification({
              message: err.message || "Failed to update profile.",
              severity: "error",
            })
          );
        });
    } else {
      dispatch(
        showNotification({ message: "No changes to update.", severity: "info" })
      );
    }
  };

  return (
    <Card raised>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Edit Your Profile
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone_number"
                label="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="emergency_phone"
                label="Emergency Phone"
                value={formData.emergency_phone}
                onChange={handleChange}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="years_of_experience"
                label="Years of Experience"
                value={formData.years_of_experience}
                onChange={handleChange}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  label="Vehicle Type"
                >
                  <MenuItem value="SEDAN">SEDAN</MenuItem>
                  <MenuItem value="SUV">SUV</MenuItem>
                  <MenuItem value="HATCHBACK">HATCHBACK</MenuItem>
                  <MenuItem value="LUXURY">LUXURY</MenuItem>
                  <MenuItem value="TEMPO">TEMPO</MenuItem>
                  <MenuItem value="MINIBUS">MINIBUS</MenuItem>
                  <MenuItem value="BUS">BUS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="fare_per_km"
                label="Fare Per Km"
                value={formData.fare_per_km}
                onChange={handleChange}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="driver_allowance"
                label="Driver Allowance"
                value={formData.driver_allowance}
                onChange={handleChange}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="spoken_languages"
                label="Spoken Languages"
                value={formData.spoken_languages}
                onChange={handleChange}
                variant="outlined"
                helperText="Comma-separated (e.g., English, Hindi)"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <CircularProgress size={24} />
              ) : (
                "Save Changes"
              )}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
