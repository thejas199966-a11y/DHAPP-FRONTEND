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
  useTheme,
  useMediaQuery,
  Badge,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

import { fetchDriverProfile } from "../features/driverSlice";
import {
  fetchMyBookings,
  fetchDriverOffers,
  acceptTripOffer,
  rejectTripOffer,
} from "../features/tripSlice";
import { showNotification } from "../features/notificationSlice";

import BookingRequests from "../components/BookingRequests";
import DashboardHome from "../components/DashboardHome";
import AnimatedMenuIcon from "../components/AnimatedMenuIcon";

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
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapse by default on mobile

  const { profile, profileStatus } = useSelector((state) => state.drivers);
  // Get both confirmed bookings and pending offers
  const {
    bookings,
    offers,
    status: tripsStatus,
  } = useSelector((state) => state.trips);

  // --- REAL-TIME POLLING ---
  useEffect(() => {
    // Initial Fetch
    dispatch(fetchDriverProfile());
    dispatch(fetchMyBookings());
    dispatch(fetchDriverOffers());

    // Poll for new offers every 30 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchDriverOffers());
      // Optionally refresh bookings too
      dispatch(fetchMyBookings());
    }, 30000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleDrawerToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMenuItemClick = (view) => {
    setActiveView(view);
    if (isMobile) setIsCollapsed(true);
  };

  // --- HANDLERS FOR OFFERS ---
  const handleAcceptOffer = (offerId) => {
    dispatch(acceptTripOffer(offerId))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({ message: "Trip Accepted!", severity: "success" }),
        );
        dispatch(fetchMyBookings()); // Refresh my trips
      })
      .catch((err) => {
        dispatch(
          showNotification({
            message: err.message || "Failed to accept.",
            severity: "error",
          }),
        );
      });
  };

  const handleRejectOffer = (offerId) => {
    dispatch(rejectTripOffer(offerId))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({ message: "Trip Rejected.", severity: "info" }),
        );
      })
      .catch((err) => {
        dispatch(
          showNotification({ message: "Failed to reject.", severity: "error" }),
        );
      });
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, view: "home" },
    {
      text: "New Requests",
      icon: (
        <Badge badgeContent={offers?.length || 0} color="error">
          <NotificationsActiveIcon />
        </Badge>
      ),
      view: "requests",
    },
    { text: "My Trips", icon: <DirectionsCarIcon />, view: "mytrips" },
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
          <AnimatedMenuIcon isOpen={!isCollapsed} />
        </ListItemButton>
      </ListItem>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            selected={activeView === item.view}
            onClick={() => handleMenuItemClick(item.view)}
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
    if (profileStatus === "loading")
      return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;

    switch (activeView) {
      case "home":
        return <DashboardHome profile={profile} bookings={bookings} />;
      case "requests":
        return (
          <BookingRequests
            offers={offers} // Pass offers here
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
            isHistory={false}
          />
        );
      case "mytrips":
        // We can reuse BookingRequests or create a TripHistory component
        // For now, reusing BookingRequests in "read-only" mode or adapting it
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upcoming & Past Trips
            </Typography>
            {/* If you want to reuse the component for Bookings, you'd map bookings to a similar structure or create a new component */}
            <Alert severity="info">Trip History view coming soon...</Alert>
          </Box>
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
        onClick={isMobile && !isCollapsed ? handleDrawerToggle : undefined}
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
