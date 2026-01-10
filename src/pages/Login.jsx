import { useState, useMemo, useRef, useEffect } from "react";
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
  InputAdornment,
  IconButton,
  CircularProgress,
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
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("user"); // 'user' | 'driver' | 'organisation'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

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
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    setTimeout(() => {
      if (passwordRef.current) {
        const valueLength = passwordRef.current.value.length;
        passwordRef.current.selectionStart = valueLength;
        passwordRef.current.selectionEnd = valueLength;
        passwordRef.current.focus();
      }
    }, 0);
  }, [showPassword]);

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

    if (length < 6)
      return { level: 0, text: "login.very_weak", color: "error" };
    if (length >= 6 && length <= 10 && (!hasUpper || !hasLower || !hasSpecial))
      return { level: 1, text: "login.weak", color: "warning" };
    if (length >= 6 && length <= 10 && hasUpper && hasLower && hasSpecial)
      return { level: 2, text: "login.medium", color: "info" };
    if (length >= 11 && length <= 13 && hasUpper && hasLower && hasSpecial)
      return { level: 3, text: "login.strong", color: "success" };
    if (length > 13 && length <= 15 && hasLower && hasUpper && hasSpecial)
      return { level: 4, text: "login.very_strong", color: "success" };
    return { level: 0, text: "login.very_weak", color: "error" };
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const endpoint = isSignup ? "/auth/signup" : "/auth/login";

    // Inject Role into payload
    const payload = { ...formData, role: role };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        payload
      );

      dispatch(
        loginSuccess({ token: res.data.access_token, user: res.data.user })
      );
      navigate("/");
    } catch (err) {
      dispatch(
        showNotification({
          message:
            t("login.error_prefix") +
            (err.response?.data?.detail || t("login.login_failed")),
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Login Failed");
    setLoading(false);
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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
            disabled={loading}
          >
            <ToggleButton value="user" sx={{ flex: 1 }} disabled={loading}>
              <PersonIcon sx={{ mr: 1 }} /> {t("login.user_role")}
            </ToggleButton>
            <ToggleButton value="driver" sx={{ flex: 1 }} disabled={loading}>
              <DirectionsCarIcon sx={{ mr: 1 }} /> {t("login.driver_role")}
            </ToggleButton>
            <ToggleButton
              value="organisation"
              sx={{ flex: 1 }}
              disabled={loading}
            >
              <BusinessIcon sx={{ mr: 1 }} /> {t("login.org_role")}
            </ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
            {isSignup
              ? t("login.create_account_title")
              : t("login.login_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {role === "driver"
              ? t("login.driver_subtitle")
              : role === "organisation"
              ? t("login.org_subtitle")
              : t("login.user_subtitle")}
          </Typography>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <>
                {/* Fields for User/Driver Full Name */}
                {role !== "organisation" && (
                  <TextField
                    fullWidth
                    label={t("login.full_name_label")}
                    margin="normal"
                    disabled={loading}
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
                      label={t("login.org_name_label")}
                      margin="normal"
                      disabled={loading}
                      onChange={(e) =>
                        setFormData({ ...formData, org_name: e.target.value })
                      }
                    />
                    <TextField
                      fullWidth
                      label={t("login.contact_number_label")}
                      margin="normal"
                      disabled={loading}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_number: e.target.value,
                        })
                      }
                    />
                    <TextField
                      fullWidth
                      label={t("login.address_label")}
                      margin="normal"
                      disabled={loading}
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
                      label={t("login.phone_number_label")}
                      margin="normal"
                      disabled={loading}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                    />
                    <TextField
                      fullWidth
                      label={t("login.license_number_label")}
                      margin="normal"
                      disabled={loading}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          license_number: e.target.value,
                        })
                      }
                    />
                    <FormControl fullWidth margin="normal" disabled={loading}>
                      <InputLabel>{t("login.vehicle_type_label")}</InputLabel>
                      <Select
                        value={formData.vehicle_type}
                        label={t("login.vehicle_type_label")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicle_type: e.target.value,
                          })
                        }
                        disabled={loading}
                      >
                        <MenuItem value="SEDAN">{t("login.sedan")}</MenuItem>
                        <MenuItem value="SUV">{t("login.suv")}</MenuItem>
                        <MenuItem value="HATCHBACK">
                          {t("login.hatchback")}
                        </MenuItem>
                        <MenuItem value="LUXURY">{t("login.luxury")}</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
              </>
            )}

            <TextField
              fullWidth
              label={
                role === "organisation"
                  ? t("login.business_email_label")
                  : t("login.email_label")
              }
              margin="normal"
              disabled={loading}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <TextField
              fullWidth
              label={t("login.password_label")}
              type={showPassword ? "text" : "password"}
              inputRef={passwordRef}
              margin="normal"
              disabled={loading}
              inputProps={{
                maxLength: 15, // Hard limit for user typing
                minLength: 6, // Good practice for minimum security
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={t("login.password_helper")}
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
                  {t(passwordStrength.text)}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isSignup ? (
                t("login.signup_button")
              ) : (
                t("login.login_title")
              )}
            </Button>
          </form>

          {/* Social Login only for 'user' role usually */}
          {role === "user" && (
            <>
              <Divider sx={{ my: 2 }}>{t("login.or_divider")}</Divider>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  opacity: loading ? 0.5 : 1,
                  pointerEvents: loading ? "none" : "auto",
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </Box>
            </>
          )}

          <Button
            sx={{ mt: 2 }}
            onClick={() => setIsSignup(!isSignup)}
            disabled={loading}
          >
            {isSignup
              ? t("login.switch_to_login")
              : t("login.switch_to_signup")}
          </Button>
        </Paper>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;
