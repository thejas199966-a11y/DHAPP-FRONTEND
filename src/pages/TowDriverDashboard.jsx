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
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import axios from "axios";

import { fetchTowDriverProfile } from "../features/towTruckDriverSlice";
import {
  fetchTowDriverOffers,
  fetchMyTowBookings,
  acceptTowTripOffer,
  rejectTowTripOffer,
} from "../features/towTripSlice";
import { showNotification } from "../features/notificationSlice";

import BookingRequests from "../components/BookingRequests";
import DashboardHome from "../components/DashboardHome";
import AnimatedMenuIcon from "../components/AnimatedMenuIcon";
import TowTrackingView from "../components/TowTrackingView";

const drawerWidth = 240;
const collapsedDrawerWidth = 60;
const mobileDrawerWidth = "40vw";
const mobileCollapsedDrawerWidth = "15vw";

const TowDriverDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeView, setActiveView] = useState("home");
  const [isCollapsed, setIsCollapsed] = useState(true);

  const { token } = useSelector((state) => state.auth);
  const { profile, profileStatus } = useSelector(
    (state) => state.towTruckDrivers,
  );
  const {
    offers,
    bookings,
    status: towTripsStatus,
  } = useSelector((state) => state.towTrips);

  const activeTrip = bookings?.find(
    (b) =>
      b.status === "accepted" ||
      b.status === "in_progress" ||
      b.status === "arrived",
  );

  useEffect(() => {
    dispatch(fetchTowDriverProfile());
    dispatch(fetchTowDriverOffers());
    dispatch(fetchMyTowBookings());

    const intervalId = setInterval(() => {
      dispatch(fetchTowDriverOffers());
      dispatch(fetchMyTowBookings());
    }, 15000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    if (!token || !activeTrip) return;

    let locInterval;
    if (navigator.geolocation) {
      const sendLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const payload = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              heading: pos.coords.heading || 0,
              speed: pos.coords.speed || 0,
              trip_id: activeTrip.id,
            };

            axios
              .post(
                `${import.meta.env.VITE_API_BASE_URL}/tracking/update`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } },
              )
              .catch((err) => {
                console.error("Location update failed:", err);
                if (
                  err.response &&
                  (err.response.status === 400 || err.response.status === 403)
                ) {
                  dispatch(fetchMyTowBookings());
                }
              });
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true },
        );
      };

      sendLocation();
      locInterval = setInterval(sendLocation, 15000);
    }

    return () => {
      if (locInterval) clearInterval(locInterval);
    };
  }, [token, activeTrip?.id, dispatch]);

  const handleDrawerToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMenuItemClick = (view) => {
    setActiveView(view);
    if (isMobile) setIsCollapsed(true);
  };

  const handleAcceptOffer = (offerId) => {
    dispatch(acceptTowTripOffer(offerId))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({ message: "Job Accepted!", severity: "success" }),
        );
        dispatch(fetchMyTowBookings());
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
    dispatch(rejectTowTripOffer(offerId))
      .unwrap()
      .then(() => {
        dispatch(
          showNotification({ message: "Job Rejected.", severity: "info" }),
        );
      })
      .catch((err) => {
        dispatch(
          showNotification({
            message: err.message || "Failed to reject.",
            severity: "error",
          }),
        );
      });
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, view: "home" },
    {
      text: "New Jobs",
      icon: (
        <Badge badgeContent={offers?.length || 0} color="error">
          <NotificationsActiveIcon />
        </Badge>
      ),
      view: "requests",
    },
    { text: "My Jobs", icon: <LocalShippingIcon />, view: "mytrips" },
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
              primary={t(`tow_driver_dashboard.${item.view}_menu`, item.text)}
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
    if (profileStatus === "loading" || towTripsStatus === "loading")
      return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;

    switch (activeView) {
      case "home":
        return (
          <DashboardHome
            profile={profile}
            bookings={bookings}
            title="Tow Dashboard"
          />
        );
      case "requests":
        return (
          <BookingRequests
            offers={offers}
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
            isHistory={false}
          />
        );
      case "mytrips":
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
        return <DashboardHome profile={profile} bookings={bookings} />;
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
          {activeTrip
            ? "Active Job"
            : menuItems.find((item) => item.view === activeView)?.text}
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default TowDriverDashboard;
