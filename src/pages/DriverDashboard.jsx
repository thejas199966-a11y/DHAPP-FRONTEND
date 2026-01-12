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
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import MenuIcon from "@mui/icons-material/Menu";

import { fetchDriverProfile } from "../features/driverSlice";
import { fetchDriverBookings, updateTripStatus } from "../features/tripSlice";
import { showNotification } from "../features/notificationSlice";

import ProfileEditor from "../components/ProfileEditor";
import BookingRequests from "../components/BookingRequests";
import DashboardHome from "../components/DashboardHome";

const drawerWidth = 240;
const collapsedDrawerWidth = 60;
const mobileDrawerWidth = "40vw";
const mobileCollapsedDrawerWidth = "15vw";

const DriverDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeView, setActiveView] = useState("home");
  const [isCollapsed, setIsCollapsed] = useState(isMobile); // Collapse by default on mobile

  const { profile, profileStatus } = useSelector((state) => state.drivers);
  const { bookings, status: bookingsStatus } = useSelector(
    (state) => state.trips
  );

  useEffect(() => {
    dispatch(fetchDriverProfile());
    dispatch(fetchDriverBookings());
  }, [dispatch]);

  const handleDrawerToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

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

  const currentDrawerWidth = isMobile
    ? isCollapsed
      ? mobileCollapsedDrawerWidth
      : mobileDrawerWidth
    : isCollapsed
    ? collapsedDrawerWidth
    : drawerWidth;

  const drawerContent = (
    <List>
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleDrawerToggle}
          sx={{
            justifyContent: isCollapsed ? "flex-start" : "flex-end",
          }}
        >
          <MenuIcon />
        </ListItemButton>
      </ListItem>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            selected={activeView === item.view}
            onClick={() => setActiveView(item.view)}
            sx={{
              justifyContent: isCollapsed ? "center" : "initial",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isCollapsed ? "auto" : 3,
                justifyContent: "center",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={t(`driver_dashboard.${item.view}_menu`, item.text)}
              sx={{
                opacity: isCollapsed ? 0 : 1,
                "& .MuiTypography-root": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

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
          width: currentDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: currentDrawerWidth,
            boxSizing: "border-box",
            position: "relative",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${currentDrawerWidth})`,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {menuItems.find((item) => item.view === activeView)?.text}
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default DriverDashboard;
