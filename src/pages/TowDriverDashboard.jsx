import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  CircularProgress, Typography, useTheme, useMediaQuery, Badge, Alert
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import axios from "axios";

import { fetchTowDriverProfile } from "../features/towTruckDriverSlice";
import {
  fetchTowDriverOffers,
  fetchMyTowBookings, 
  acceptTowTripOffer,
  rejectTowTripOffer
} from "../features/towTripSlice";
import { showNotification } from "../features/notificationSlice";

import BookingRequests from "../components/BookingRequests";
import DashboardHome from "../components/DashboardHome";
import AnimatedMenuIcon from "../components/AnimatedMenuIcon";

const drawerWidth = 240;
const collapsedDrawerWidth = 60;

const TowDriverDashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const [activeView, setActiveView] = useState("home");
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Auth & Profile
  const { token } = useSelector((state) => state.auth);
  const { profile, profileStatus } = useSelector((state) => state.towTruckDrivers);
  
  // Trips Data
  const { offers, bookings } = useSelector((state) => state.towTrips);

  // Identify Active Trip
  const activeTrip = bookings?.find(b => 
    b.status === 'accepted' || b.status === 'in_progress' || b.status === 'arrived'
  );
  
  // --- POLLING FOR DATA ---
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

  // --- LOCATION TRACKING LOGIC (Conditional) ---
  useEffect(() => {
    // STOP if no token or NO ACTIVE TRIP
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
                trip_id: activeTrip.id // Must exist
            };

            axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/tracking/update`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .catch((err) => {
                  console.error("Location update failed:", err);
                  // Optional: if 403/400, maybe refresh bookings to see if trip was cancelled
                  if (err.response && (err.response.status === 400 || err.response.status === 403)) {
                      dispatch(fetchMyTowBookings());
                  }
              });
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      };

      // Send immediately and then loop
      sendLocation();
      locInterval = setInterval(sendLocation, 15000);
    }

    return () => {
      if (locInterval) clearInterval(locInterval);
    };
  }, [token, activeTrip?.id]); // Depend strictly on activeTrip ID

  const handleDrawerToggle = () => setIsCollapsed(!isCollapsed);

  const handleAcceptOffer = (offerId) => {
    dispatch(acceptTowTripOffer(offerId))
      .unwrap()
      .then(() => {
          dispatch(showNotification({ message: "Job Accepted!", severity: "success" }));
          dispatch(fetchMyTowBookings()); // Refresh to trigger tracking
      })
      .catch(() => dispatch(showNotification({ message: "Failed to accept.", severity: "error" })));
  };

  const handleRejectOffer = (offerId) => {
    dispatch(rejectTowTripOffer(offerId))
        .unwrap()
        .then(() => dispatch(showNotification({ message: "Job Rejected.", severity: "info" })))
        .catch(() => dispatch(showNotification({ message: "Failed to reject.", severity: "error" })));
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

  const renderContent = () => {
    if (profileStatus === "loading") return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;

    switch (activeView) {
      case "home":
        return <DashboardHome profile={profile} bookings={bookings} title="Tow Dashboard" />;
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
                <Typography variant="h5" gutterBottom>My Jobs</Typography>
                {bookings && bookings.length > 0 ? (
                    <BookingRequests 
                        offers={bookings.map(b => ({ id: b.id, trip: b, status: b.status }))} 
                        isHistory={true} 
                    />
                ) : (
                    <Alert severity="info">No jobs history found.</Alert>
                )}
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
          width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: "width 0.3s",
          },
        }}
      >
        <List>
            <ListItem disablePadding>
                <ListItemButton onClick={handleDrawerToggle}>
                    <AnimatedMenuIcon isOpen={!isCollapsed} />
                </ListItemButton>
            </ListItem>
            {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                    <ListItemButton onClick={() => setActiveView(item.view)}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} sx={{ opacity: isCollapsed ? 0 : 1 }} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default TowDriverDashboard;