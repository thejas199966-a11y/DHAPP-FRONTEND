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

// Pages
import Login from "./pages/Login";
import UserDashboard from "./pages/Dashboard";
import BookDriver from "./pages/BookDriver";
import BookTravel from "./pages/BookTravel";
import DriverDashboard from "./pages/DriverDashboard";
import OrgDashboard from "./pages/OrgDashboard";

function App() {
  const { mode } = useSelector((state) => state.theme);
  const theme = mode === "light" ? lightTheme : darkTheme;

  // --- 1. SMART HOME COMPONENT (Redirects based on Role) ---
  const RoleBasedHome = () => {
    const { token, user } = useSelector((state) => state.auth);

    if (!token) return <Navigate to="/login" />;

    const role = user?.role || "user";

    if (role === "driver") return <DriverDashboard />;
    if (role === "organisation") return <OrgDashboard />;

    // Default: User Dashboard
    return <UserDashboard />;
  };

  // --- 2. ROLE PROTECTED ROUTE (Security Guard) ---
  // Checks if you are logged in AND if you have the right role
  const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const { token, user } = useSelector((state) => state.auth);

    // 1. Check Authentication
    if (!token) return <Navigate to="/login" />;

    // 2. Check Authorization (Role)
    // If specific roles are required, and the user doesn't match...
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      // Redirect them back to their safety zone (Home/Dashboard)
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Notification />
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
              <Route path="/login" element={<Login />} />

              {/* Root Path: Decides which Dashboard to show */}
              <Route path="/" element={<RoleBasedHome />} />

              {/* --- RESTRICTED USER ROUTES --- */}
              {/* Only 'user' role can access these. Drivers/Orgs will be redirected to Home */}
              <Route
                path="/book-driver"
                element={
                  <RoleProtectedRoute allowedRoles={["user"]}>
                    <BookDriver />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/book-travel"
                element={
                  <RoleProtectedRoute allowedRoles={["user"]}>
                    <BookTravel />
                  </RoleProtectedRoute>
                }
              />

              {/* If you add specific routes for drivers later, you restrict them like this: */}
              {/* <Route 
                path="/my-trips" 
                element={
                  <RoleProtectedRoute allowedRoles={['driver']}>
                    <DriverTrips />
                  </RoleProtectedRoute>
                } 
              /> 
              */}
            </Routes>
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;
