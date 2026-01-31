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
import NotFound from "./pages/NotFound";
import BookTowDriver from "./pages/BookTowDriver";

function App() {
  const { mode } = useSelector((state) => state.theme);
  const theme = mode === "light" ? lightTheme : darkTheme;

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Notification />
        <LoginModal />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<UserDashboard />} />
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
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
