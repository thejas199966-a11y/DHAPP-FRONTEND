import { useState, useMemo } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/authSlice";
import { showNotification } from "../features/notificationSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BusinessIcon from "@mui/icons-material/Business";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("user"); // 'user' | 'driver' | 'organisation'

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    // Extra fields for specific roles
    license_number: "", // For Driver
    vehicle_type: "", // For Driver
    phone_number: "", // For Driver
    org_name: "", // For Organisation
    contact_number: "", // For Organisation
    address: "", // For Organisation
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle Role Toggle
  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const getPasswordStrength = (password) => {
    const length = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (length < 6) return { level: 0, text: "Very Weak", color: "error" };
    if (length >= 6 && length <= 10 && (!hasUpper || !hasLower || !hasSpecial))
      return { level: 1, text: "Weak", color: "warning" };
    if (length >= 6 && length <= 10 && hasUpper && hasLower && hasSpecial)
      return { level: 2, text: "Medium", color: "info" };
    if (length >= 11 && length <= 13 && hasUpper && hasLower && hasSpecial)
      return { level: 3, text: "Strong", color: "success" };
    if (length > 13 && length <= 15 && hasLower && hasUpper && hasSpecial)
      return { level: 4, text: "Very Strong", color: "success" };
    return { level: 0, text: "Very Weak", color: "error" };
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In real app, endpoint changes based on role, or payload includes role
    // For now, we simulate success for UI demo purposes

    const endpoint = isSignup ? "/auth/signup" : "/auth/login";

    // Inject Role into payload
    const payload = { ...formData, role: role };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        payload
      );

      // IMPORTANT: Backend must return the role in 'user' object for this to work perfectly.
      // If backend doesn't yet, the Dashboard logic below might need a temporary hardcode.
      dispatch(
        loginSuccess({ token: res.data.access_token, user: res.data.user })
      );
      navigate("/");
    } catch (err) {
      dispatch(
        showNotification({
          message: "Error: " + (err.response?.data?.detail || "Login failed"),
          severity: "error",
        })
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/google?token=${
          credentialResponse.credential
        }`
      );
      dispatch(
        loginSuccess({ token: res.data.access_token, user: res.data.user })
      );
      navigate("/");
    } catch (err) {
      console.error("Google Login Error", err);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f0f2f5",
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 4, width: "100%", maxWidth: 450, textAlign: "center" }}
        >
          {/* --- ROLE TOGGLE --- */}
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={handleRoleChange}
            aria-label="User Role"
            color="primary"
            sx={{ mb: 3, width: "100%" }}
          >
            <ToggleButton value="user" sx={{ flex: 1 }}>
              <PersonIcon sx={{ mr: 1 }} /> User
            </ToggleButton>
            <ToggleButton value="driver" sx={{ flex: 1 }}>
              <DirectionsCarIcon sx={{ mr: 1 }} /> Driver
            </ToggleButton>
            <ToggleButton value="organisation" sx={{ flex: 1 }}>
              <BusinessIcon sx={{ mr: 1 }} /> Org
            </ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
            {isSignup
              ? `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`
              : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {role === "driver"
              ? "Manage your rides and earnings"
              : role === "organisation"
              ? "Manage your fleet and drivers"
              : "Book rides and travel packages"}
          </Typography>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <>
                {/* Fields for User/Driver Full Name */}
                {role !== "organisation" && (
                  <TextField
                    fullWidth
                    label="Full Name"
                    margin="normal"
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                )}

                {/* Fields Specific to Organisation */}
                {role === "organisation" && (
                  <>
                    <TextField
                      fullWidth
                      label="Organisation Name"
                      margin="normal"
                      onChange={(e) =>
                        setFormData({ ...formData, org_name: e.target.value })
                      }
                    />
                    <TextField
                      fullWidth
                      label="Contact Number"
                      margin="normal"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_number: e.target.value,
                        })
                      }
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      margin="normal"
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </>
                )}

                {/* Fields Specific to Driver */}
                {role === "driver" && (
                  <>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      margin="normal"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                    />
                    <TextField
                      fullWidth
                      label="Driving License Number"
                      margin="normal"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          license_number: e.target.value,
                        })
                      }
                    />
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Vehicle Type</InputLabel>
                      <Select
                        value={formData.vehicle_type}
                        label="Vehicle Type"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicle_type: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="SEDAN">SEDAN</MenuItem>
                        <MenuItem value="SUV">SUV</MenuItem>
                        <MenuItem value="HATCHBACK">HATCHBACK</MenuItem>
                        <MenuItem value="LUXURY">LUXURY</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
              </>
            )}

            <TextField
              fullWidth
              label={role === "organisation" ? "Business Email" : "Email"}
              margin="normal"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              inputProps={{
                maxLength: 15, // Hard limit for user typing
                minLength: 6, // Good practice for minimum security
              }}
              helperText="Password must be 6-15 chars with uppercase, lowercase, special char"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {isSignup && formData.password && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength.level / 4) * 100}
                  color={passwordStrength.color}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, textAlign: "center" }}
                >
                  {passwordStrength.text}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{ mt: 3, mb: 2 }}
            >
              {isSignup ? "Sign Up" : "Login"}
            </Button>
          </form>

          {/* Social Login only for 'user' role usually */}
          {role === "user" && (
            <>
              <Divider sx={{ my: 2 }}>OR</Divider>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log("Login Failed")}
                />
              </Box>
            </>
          )}

          <Button sx={{ mt: 2 }} onClick={() => setIsSignup(!isSignup)}>
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </Button>
        </Paper>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;
