import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import BookOnlineIcon from "@mui/icons-material/BookOnline";

import { fetchDriverProfile } from "../features/driverSlice";
import { fetchDriverBookings, updateTripStatus } from "../features/tripSlice";
import { showNotification } from "../features/notificationSlice";

import ProfileEditor from "../components/ProfileEditor";
import BookingRequests from "../components/BookingRequests";
import DashboardHome from "../components/DashboardHome";

const drawerWidth = 240;

const DriverDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState("home");

  const { profile, profileStatus } = useSelector((state) => state.drivers);
  const { bookings, status: bookingsStatus } = useSelector(
    (state) => state.trips
  );

  useEffect(() => {
    dispatch(fetchDriverProfile());
    dispatch(fetchDriverBookings());
  }, [dispatch]);

  const handleUpdateStatus = (tripId, status) => {
    dispatch(updateTripStatus({ tripId, status }))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({
            message: `Booking ${status}`,
            severity: "success",
          })
        );
      })
      .catch((err) => {
        dispatch(
          showNotification({
            message: err.message || "Failed to update status.",
            severity: "error",
          })
        );
      });
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, view: "home" },
    { text: "My Profile", icon: <PersonIcon />, view: "profile" },
    { text: "Booking Requests", icon: <BookOnlineIcon />, view: "bookings" },
  ];

  const renderContent = () => {
    if (profileStatus === "loading" || bookingsStatus === "loading") {
      return <CircularProgress />;
    }
    if (profileStatus === "failed" && bookingsStatus === "failed") {
      return (
        <Alert severity="error">
          Error loading dashboard data. Please try again later.
        </Alert>
      );
    }

    switch (activeView) {
      case "home":
        return <DashboardHome />;
      case "profile":
        return <ProfileEditor profile={profile} status={profileStatus} />;
      case "bookings":
        const pendingBookings = bookings.filter((b) => b.status === "pending");
        return (
          <BookingRequests
            bookings={pendingBookings}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "relative", // Key change to keep it in flow
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={activeView === item.view}
                onClick={() => setActiveView(item.view)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={t(`driver_dashboard.${item.view}_menu`, item.text)}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {menuItems.find((item) => item.view === activeView)?.text}
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default DriverDashboard;
