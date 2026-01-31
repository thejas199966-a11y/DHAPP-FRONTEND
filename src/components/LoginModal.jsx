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

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";

const LoginModal = () => {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);
  const initialLaunch = useRef(true);

  const { isLoginModalOpen, initialView } = useSelector(
    (state) => state.authModal,
  );
  const { emailVerificationStatus, emailVerificationError } = useSelector(
    (state) => state.auth,
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
  });

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
    [formData.password],
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
        }),
      );
      return;
    }

    setLoading(true);

    const endpoint = isSignup ? "/auth/signup" : "/auth/login";
    const payload = { ...formData, role: "user" };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        payload,
      );

      dispatch(
        loginSuccess({ token: res.data.access_token, user: res.data.user }),
      );
      handleClose();
    } catch (err) {
      dispatch(
        showNotification({
          message:
            t("login.error_prefix") +
            (err.response?.data?.detail || t("login.login_failed")),
          severity: "error",
        }),
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
        }`,
      );
      dispatch(
        loginSuccess({ token: res.data.access_token, user: res.data.user }),
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
                  {t("login.user_subtitle")}
                </Typography>

                <form onSubmit={handleSubmit}>
                  {isSignup && (
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

                  <TextField
                    fullWidth
                    label={t("login.email_label")}
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

                {/* Social Login */}
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
