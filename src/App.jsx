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
import BookTravel from "./pages/BookTravel";
import DriverDashboard from "./pages/DriverDashboard";
import OrgDashboard from "./pages/OrgDashboard";
import NotFound from "./pages/NotFound";
import DriverDetailPage from "./pages/DriverDetailPage";

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
        <Routes>
          <Route element={<MainLayout />}>
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
              path="/driver-detail"
              element={
                <ProtectedRoute>
                  <DriverDetailPage />
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
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
