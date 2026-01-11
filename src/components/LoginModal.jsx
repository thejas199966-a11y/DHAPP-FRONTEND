import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Modal,
  Fade,
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import {
  loginSuccess,
  verifyEmail,
  resetEmailVerification,
} from "../features/authSlice";
import { showNotification } from "../features/notificationSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { closeLoginModal } from "../features/authModalSlice";
import user_media from "../assets/videos/user_login_signup.mp4";
// NOTE: You can replace these with specific videos for each role
import driver_media from "../assets/videos/user_login_signup.mp4";
import org_media from "../assets/videos/user_login_signup.mp4";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BusinessIcon from "@mui/icons-material/Business";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";

const LoginModal = () => {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("user"); // 'user' | 'driver' | 'organisation'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);
  const initialLaunch = useRef(true);

  const { isLoginModalOpen, initialView } = useSelector(
    (state) => state.authModal
  );
  const { emailVerificationStatus, emailVerificationError } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoginModalOpen) {
      setIsSignup(initialView === "signup");
    } else {
      // Reset verification state when modal closes
      dispatch(resetEmailVerification());
    }
  }, [isLoginModalOpen, initialView, dispatch]);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
    initialLaunch.current = false;
  };

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

  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleEmailChange = (e) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleEmailBlur = () => {
    if (isSignup && formData.email) {
      if (emailVerificationStatus !== "idle") {
        dispatch(resetEmailVerification());
      }
      dispatch(verifyEmail(formData.email));
    }
  };

  // --- CONFIG FOR ROLES (ICONS & VIDEOS) ---
  const roleData = [
    {
      id: "user",
      label: t("login.user_role"),
      icon: PersonIcon,
      videoSrc: user_media,
    },
    {
      id: "driver",
      label: t("login.driver_role"),
      icon: DirectionsCarIcon,
      videoSrc: driver_media,
    },
    {
      id: "organisation",
      label: t("login.org_role"),
      icon: BusinessIcon,
      videoSrc: org_media,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      if (passwordRef.current && !initialLaunch.current) {
        const valueLength = passwordRef.current.value.length;
        passwordRef.current.selectionStart = valueLength;
        passwordRef.current.selectionEnd = valueLength;
        passwordRef.current.focus();
      }
    }, 0);
  }, [showPassword]);

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

  const handleClose = () => {
    if (loading) return;
    dispatch(closeLoginModal());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (isSignup && emailVerificationStatus !== "succeeded") {
      dispatch(
        showNotification({
          message: "Please enter a valid email address.",
          severity: "error",
        })
      );
      return;
    }

    setLoading(true);

    const endpoint = isSignup ? "/auth/signup" : "/auth/login";
    const payload = { ...formData, role: role };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        payload
      );

      dispatch(
        loginSuccess({ token: res.data.access_token, user: res.data.user })
      );
      handleClose();
      if (res.data.user.role === "driver") navigate("/driver-dashboard");
      if (res.data.user.role === "organisation") navigate("/org-dashboard");
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
      handleClose();
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

  const isSignupButtonDisabled =
    loading ||
    (isSignup &&
      emailVerificationStatus !== "succeeded" &&
      formData.email !== "");

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Modal
        open={isLoginModalOpen}
        closeAfterTransition
        hideBackdrop
        sx={{ overflowY: "auto", bgcolor: "background.default" }}
      >
        <div>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 1301, // z-index of modal is 1300
              color: "text.primary",
            }}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
          <Fade in={isLoginModalOpen}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: { xs: 2, sm: 8 },
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, sm: 3 },
                  width: "100%",
                  maxWidth: 450,
                  textAlign: "center",
                  mx: 2,
                }}
              >
                {/* --- CUSTOM ROLE SELECTOR --- */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  {roleData.map((item) => {
                    const isActive = role === item.id;
                    return (
                      <Box
                        key={item.id}
                        onClick={() => !loading && setRole(item.id)}
                        sx={{
                          flex: 1,
                          height: 100, // Fixed height for the card
                          borderRadius: 2,
                          border: isActive
                            ? "2px solid #1976d2"
                            : "1px solid #e0e0e0",
                          position: "relative",
                          overflow: "hidden",
                          cursor: loading ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          bgcolor: isActive ? "transparent" : "#fff",
                          "&:hover": {
                            borderColor: "#1976d2",
                          },
                        }}
                      >
                        {/* Background Video (Only visible when active) */}
                        {isActive && (
                          <video
                            key={item.videoSrc} // Add key to force re-render on src change
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              zIndex: 0,
                              opacity: 0.8,
                            }}
                          >
                            <source src={item.videoSrc} type="video/mp4" />
                          </video>
                        )}

                        {/* Optional Overlay to improve text contrast on video */}
                        {isActive && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              bgcolor: "rgba(255, 255, 255, 0.7)", // White tint overlay
                              zIndex: 1,
                            }}
                          />
                        )}

                        {/* Content Container (Icon + Text) */}
                        <Box
                          sx={{
                            position: "absolute",
                            zIndex: 2,
                            width: "100%",
                            // Nav-like animation logic:
                            top: isActive ? "8px" : "50%",
                            left: "50%",
                            transform: isActive
                              ? "translate(-50%, 0) scale(0.85)"
                              : "translate(-50%, -50%) scale(1)",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isActive ? "#1565c0" : "#757575",
                          }}
                        >
                          <item.icon
                            sx={{ fontSize: isActive ? 28 : 32, mb: 0.5 }}
                          />
                          <Typography
                            variant="button"
                            sx={{
                              fontSize: isActive ? "0.75rem" : "0.875rem",
                              fontWeight: "bold",
                              lineHeight: 1.2,
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                {/* --- END CUSTOM ROLE SELECTOR --- */}

                <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
                  {isSignup
                    ? t("login.create_account_title")
                    : t("login.login_title")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
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
                            setFormData({
                              ...formData,
                              full_name: e.target.value,
                            })
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
                              setFormData({
                                ...formData,
                                org_name: e.target.value,
                              })
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
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
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
                          <FormControl
                            fullWidth
                            margin="normal"
                            disabled={loading}
                          >
                            <InputLabel>
                              {t("login.vehicle_type_label")}
                            </InputLabel>
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
                              <MenuItem value="SEDAN">
                                {t("login.sedan")}
                              </MenuItem>
                              <MenuItem value="SUV">{t("login.suv")}</MenuItem>
                              <MenuItem value="HATCHBACK">
                                {t("login.hatchback")}
                              </MenuItem>
                              <MenuItem value="LUXURY">
                                {t("login.luxury")}
                              </MenuItem>
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
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    error={isSignup && emailVerificationStatus === "failed"}
                    helperText={
                      isSignup && emailVerificationStatus === "failed"
                        ? emailVerificationError
                        : ""
                    }
                    InputProps={{
                      endAdornment: isSignup && (
                        <InputAdornment position="end">
                          {emailVerificationStatus === "loading" && (
                            <CircularProgress size={20} />
                          )}
                          {emailVerificationStatus === "succeeded" && (
                            <CheckCircleOutlineIcon color="success" />
                          )}
                          {emailVerificationStatus === "failed" && (
                            <ErrorOutlineIcon color="error" />
                          )}
                        </InputAdornment>
                      ),
                    }}
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
                    disabled={isSignupButtonDisabled}
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
          </Fade>
        </div>
      </Modal>
    </GoogleOAuthProvider>
  );
};

export default LoginModal;
