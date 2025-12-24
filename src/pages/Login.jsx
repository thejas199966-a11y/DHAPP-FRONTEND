import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
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

  // Handle Standard Login/Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? "/auth/signup" : "/auth/login";
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000${endpoint}`,
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
        `http://127.0.0.1:8000/auth/google?token=${credentialResponse.credential}`
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
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

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
