import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box, CssBaseline } from "@mui/material"; // CssBaseline helps with cross-browser consistency
import { useSelector } from "react-redux";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookDriver from "./pages/BookDriver";
import BookTravel from "./pages/BookTravel";

function App() {
  // Protected Route Component
  const PrivateRoute = ({ children }) => {
    const { token } = useSelector((state) => state.auth);
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      {/* CssBaseline kicks in MUI's normalization */}
      <CssBaseline />
      <Notification />

      {/* minHeight: '100vh' ensures the app is AT LEAST the height of the screen.
         display: 'flex' + column allows us to push the footer to the bottom.
      */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100vw", // Explicitly take full width
        }}
      >
        <Navbar />

        {/* flexGrow: 1 pushes the Footer down if content is short */}
        <Box component="main" sx={{ flexGrow: 1, width: "100%" }}>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Wrap protected pages */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/book-driver"
              element={
                <PrivateRoute>
                  <BookDriver />
                </PrivateRoute>
              }
            />
            <Route
              path="/book-travel"
              element={
                <PrivateRoute>
                  <BookTravel />
                </PrivateRoute>
              }
            />
          </Routes>
        </Box>

        <Footer />
      </Box>
    </Router>
  );
}

export default App;
