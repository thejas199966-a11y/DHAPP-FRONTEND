import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { showNotification } from "../features/notificationSlice";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: "800px",
  height: "80vh",
  boxShadow: 24,
  p: 0,
  overflow: "hidden",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#333333",
  color: "white",
};

const navItems = ["Profile", "Account settings", "Data & privacy", "Security"];

const AccountModal = ({ open, onClose }) => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState("Profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
  });

  const VITE_API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || user.name || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const endpoint =
      user.role === "driver"
        ? `${VITE_API_URL}/drivers/me`
        : `${VITE_API_URL}/users/me`;
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
      dispatch(
        showNotification({
          message: "Profile updated successfully!",
          severity: "success",
        })
      );
      onClose();
    } catch (err) {
      setError(err.message);
      dispatch(showNotification({ message: err.message, severity: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    // Content rendering logic remains the same
    switch (activeView) {
      case "Account settings":
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Account Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ""}
                  disabled
                  variant="filled"
                  InputProps={{ style: { color: "#ccc" } }}
                  InputLabelProps={{ style: { color: "#ccc" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Change Password"
                  type="password"
                  value="************"
                  disabled
                  helperText="Password change functionality will be implemented later."
                  variant="filled"
                  InputProps={{ style: { color: "#ccc" } }}
                  InputLabelProps={{ style: { color: "#ccc" } }}
                  sx={{ display: "none" }} // Hidden as requested
                />
              </Grid>
            </Grid>
          </Box>
        );
      case "Profile":
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Profile
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="full_name"
                  label="Full Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  variant="filled"
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "#ccc" } }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
                sx={{
                  backgroundColor: "#1d1e1e",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#080808",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </Box>
          </Box>
        );
      case "Data & privacy":
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Data & Privacy
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              We are committed to protecting your privacy. Here's how we handle
              your data:
            </Typography>
            <ul>
              <li>
                <Typography variant="body2">
                  <strong>Personal Information:</strong> We collect your name,
                  email, and travel details to provide our services. We do not
                  share this information with third parties without your
                  consent.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Location Data:</strong> Location data is used to
                  facilitate bookings and is only active while you are using the
                  app for a trip.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Data Deletion:</strong> You can request the deletion
                  of your account and all associated data at any time by
                  contacting our support team.
                </Typography>
              </li>
            </ul>
          </Box>
        );
      case "Security":
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Security
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your account security is our top priority.
            </Typography>
            <Typography variant="body2">
              <strong>Password Protection:</strong> Your password is encrypted
              and stored securely. We recommend using a strong, unique password.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Two-Factor Authentication (2FA):</strong> For added
              security, we will be introducing 2FA in a future update.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>
        {`
          .account-modal-nav-container {
            position: relative;
            width: 100%;
            border-bottom: 1px solid #555;
          }

          .account-modal-nav {
            display: flex;
            flex-direction: row;
            gap: 20px;
            padding: 15px 20px;
            overflow-x: auto;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none;  /* IE and Edge */
          }

          .account-modal-nav::-webkit-scrollbar {
            display: none; /* Chrome, Safari, and Opera */
          }
          
          .nav-item {
            cursor: pointer;
            position: relative;
            padding-bottom: 5px;
            font-size: 1rem;
            color: white;
            background: none;
            border: none;
            text-align: center;
            white-space: nowrap;
          }
          
          .nav-item::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(192,192,192,0.8) 50%, rgba(255,255,255,0) 100%);
            transform: scaleX(0);
            transform-origin: bottom;
            transition: transform 0.3s ease-in-out;
          }
          
          .nav-item:hover::after, .nav-item.active::after {
            transform: scaleX(1);
          }
          
          .nav-item.active::after {
            height: 1px;
            animation: shine 1.5s infinite linear;
          }
          
          @keyframes shine {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: 200px 0;
            }
          }

          .account-modal-content {
            flex-grow: 1;
            padding: 20px;
            overflow-y: auto;
          }
        `}
      </style>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="account-modal-title"
      >
        <Box sx={modalStyle}>
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              backgroundColor: "black",
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>

          <div className="account-modal-nav-container">
            <div className="account-modal-nav">
              {navItems.map((item) => (
                <button
                  key={item}
                  className={`nav-item ${activeView === item ? "active" : ""}`}
                  onClick={() => setActiveView(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="account-modal-content">{renderContent()}</div>
        </Box>
      </Modal>
    </>
  );
};

export default AccountModal;
