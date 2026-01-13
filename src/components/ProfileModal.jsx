import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { showNotification } from "../features/notificationSlice";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  height: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
};

const UserProfileForm = ({ profile, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="full_name"
            label="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="avatar_url"
            label="Avatar URL"
            value={formData.avatar_url}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </Box>
    </form>
  );
};

const DriverProfileForm = ({ profile, onSave, onCancel, loading }) => {
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
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="name" label="Name" value={formData.name} onChange={handleChange} variant="outlined" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="address" label="Address" value={formData.address} onChange={handleChange} variant="outlined" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="phone_number" label="Phone Number" value={formData.phone_number} onChange={handleChange} variant="outlined" type="number" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="emergency_phone" label="Emergency Phone" value={formData.emergency_phone} onChange={handleChange} variant="outlined" type="number" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="years_of_experience" label="Years of Experience" value={formData.years_of_experience} onChange={handleChange} variant="outlined" type="number" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Vehicle Type</InputLabel>
            <Select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} label="Vehicle Type">
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
          <TextField fullWidth name="fare_per_km" label="Fare Per Km" value={formData.fare_per_km} onChange={handleChange} variant="outlined" type="number" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="driver_allowance" label="Driver Allowance" value={formData.driver_allowance} onChange={handleChange} variant="outlined" type="number" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth name="spoken_languages" label="Spoken Languages" value={formData.spoken_languages} onChange={handleChange} variant="outlined" helperText="Comma-separated (e.g., English, Hindi)" />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </Box>
    </form>
  );
};

const ProfileModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const role = user?.role;
  const VITE_API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (open) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        const endpoint = role === "driver" ? `${VITE_API_URL}/drivers/me` : `${VITE_API_URL}/users/me`;
        try {
          const response = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch profile");
          }
          const data = await response.json();
          setProfile(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [open, role, token, VITE_API_URL]);

  const handleSave = async (formData) => {
    setLoading(true);
    setError(null);
    const endpoint = role === "driver" ? `${VITE_API_URL}/drivers/me` : `${VITE_API_URL}/users/me`;
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to update profile");
      }
      dispatch(showNotification({ message: "Profile updated successfully!", severity: "success" }));
      onClose();
    } catch (err) {
      setError(err.message);
      dispatch(showNotification({ message: err.message, severity: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (loading && !profile) {
      return <CircularProgress />;
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (profile) {
      if (role === "driver") {
        return <DriverProfileForm profile={profile} onSave={handleSave} onCancel={onClose} loading={loading} />;
      }
      if (role === "user") {
        return <UserProfileForm profile={profile} onSave={handleSave} onCancel={onClose} loading={loading} />;
      }
    }
    return <Alert severity="info">You do not have a profile to edit.</Alert>;
  };

  return (
    <Modal open={open} onClose={(event, reason) => { if (reason !== 'backdropClick') onClose() }} aria-labelledby="profile-modal-title">
      <Box sx={modalStyle}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography id="profile-modal-title" variant="h5" component="h2">
            Edit Profile
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {renderForm()}
      </Box>
    </Modal>
  );
};

export default ProfileModal;
