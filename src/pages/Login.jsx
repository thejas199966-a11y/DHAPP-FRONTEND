import { useState, useMemo } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  LinearProgress,
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Password strength function
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

  // Handle Standard Login/Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? "/auth/signup" : "/auth/login";
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        formData
      );
      dispatch(loginSuccess(res.data.access_token));
      navigate("/"); // Go to Dashboard
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || "Login failed"));
    }
  };

  // Handle Google Login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/google?token=${
          credentialResponse.credential
        }`
      );
      dispatch(loginSuccess(res.data.access_token));
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
          sx={{ p: 4, width: "100%", maxWidth: 400, textAlign: "center" }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            {isSignup ? "Create Account" : "Welcome Back"}
          </Typography>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <TextField
                fullWidth
                label="Full Name"
                margin="normal"
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            )}
            <TextField
              fullWidth
              label="Email"
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

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Login Failed")}
            />
          </Box>

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
