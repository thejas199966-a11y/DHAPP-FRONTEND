import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { useSelector } from "react-redux";
import { lightTheme, darkTheme } from "./theme";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Notification from "./components/Notification";
import LoginModal from "./components/LoginModal";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import UserDashboard from "./pages/Dashboard";
import BookDriver from "./pages/BookDriver";
import BookTravel from "./pages/BookTravel";
import DriverDashboard from "./pages/DriverDashboard";
import OrgDashboard from "./pages/OrgDashboard";

function App() {
  const { mode } = useSelector((state) => state.theme);
  const theme = mode === "light" ? lightTheme : darkTheme;
  const { token, user } = useSelector((state) => state.auth);

  const HomeRoute = () => {
    if (token) {
      if (user?.role === "driver") return <Navigate to="/driver-dashboard" />;
      if (user?.role === "organisation")
        return <Navigate to="/org-dashboard" />;
    }
    return <UserDashboard />;
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Notification />
        <LoginModal />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            width: "100vw",
            bgcolor: "background.default",
            color: "text.primary",
          }}
        >
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, width: "100%" }}>
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route
                path="/book-driver"
                element={
                  <ProtectedRoute>
                    <BookDriver />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-travel"
                element={
                  <ProtectedRoute>
                    <BookTravel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["driver"]}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/org-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["organisation"]}>
                    <OrgDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;
