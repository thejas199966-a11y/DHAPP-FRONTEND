import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useSelector } from "react-redux";
import { lightTheme, darkTheme } from "./theme";

// Components
import Notification from "./components/Notification";
import LoginModal from "./components/LoginModal";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Pages
import UserDashboard from "./pages/Dashboard";
import BookDriver from "./pages/BookDriver";
import DriverDashboard from "./pages/DriverDashboard";
import NotFound from "./pages/NotFound";
import TowDriverDashboard from "./pages/TowDriverDashboard";
import BookTowDriver from "./pages/BookTowDriver";

function App() {
  const { mode } = useSelector((state) => state.theme);
  const theme = mode === "light" ? lightTheme : darkTheme;
  const { token, user } = useSelector((state) => state.auth);

  const HomeRoute = () => {
    if (token) {
      if (user?.role === "driver") return <Navigate to="/driver-dashboard" />;
      if (user?.role === "tow_truck_driver") return <Navigate to="/tow-driver-dashboard" />;
    }
    return <UserDashboard />;
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Notification />
        <LoginModal />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeRoute />} />
            <Route
              path="/book-driver"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <BookDriver />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-tow-driver"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <BookTowDriver />
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
              path="/tow-driver-dashboard"
              element={
                <ProtectedRoute allowedRoles={["tow_truck_driver"]}>
                  <TowDriverDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
