import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Icons for UI
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlaceIcon from "@mui/icons-material/Place";
import PhoneIcon from "@mui/icons-material/Phone";

import { cancelTowTrip, fetchMyTowBookings } from "../features/towTripSlice";
import { showNotification } from "../features/notificationSlice";

// --- PNG ICONS ---
import brokenCarPng from "../assets/images/brokenCar.png";
import towTruckPng from "../assets/images/towTruck.png";
import garagePng from "../assets/images/garage.png";

// Helper to create Leaflet Icon from PNG
const createIcon = (iconUrl, size = [50, 50]) => {
  return new L.Icon({
    iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // Anchor at bottom-center
    popupAnchor: [0, -size[1]],
  });
};

const brokenCarIcon = createIcon(brokenCarPng, [60, 40]);
const towTruckIcon = createIcon(towTruckPng, [60, 40]);
const garageIcon = createIcon(garagePng, [35, 35]);

// --- MAP HELPERS ---
const MapRecenter = ({ bounds }) => {
  const map = useMap();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: isMobile ? [50, 50] : [80, 80] });
      } catch (e) {
        console.warn("Map bounds error", e);
      }
    }
  }, [bounds, map, isMobile]);
  return null;
};

const MapInvalidator = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// --- COMPONENT ---
const TowTrackingView = ({ booking }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { token } = useSelector((state) => state.auth);

  // Local State
  const [towLocation, setTowLocation] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // 1. Geocode Start/End
  useEffect(() => {
    if (booking && !startCoords) {
      const geocode = async (address) => {
        if (!address) return null;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              address,
            )}`,
          );
          if (res.data && res.data.length > 0) {
            return {
              lat: parseFloat(res.data[0].lat),
              lng: parseFloat(res.data[0].lon),
            };
          }
        } catch (e) {
          console.error("Geocoding error", e);
        }
        return null;
      };

      const loadCoords = async () => {
        const start = await geocode(booking?.start_location);
        const end = await geocode(booking?.end_location);
        setStartCoords(start);
        setEndCoords(end);
      };
      loadCoords();
    }
  }, [booking]);

  // 2. Fetch Driver & Route
  const fetchDriverData = async () => {
    if (!booking || booking?.status !== "accepted") return;

    setIsRefreshing(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/tracking/${booking?.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      let driverPos = null;
      if (res.data.lat && res.data.lng) {
        driverPos = { lat: res.data.lat, lng: res.data.lng };
        setTowLocation(driverPos);
      }

      // Calculate Route: Driver -> Pickup
      if (driverPos && startCoords) {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${
          driverPos.lng
        },${driverPos.lat};${
          startCoords.lng
        },${startCoords.lat}?overview=full&geometries=geojson`;
        const routeRes = await axios.get(osrmUrl);
        if (routeRes.data.routes && routeRes.data.routes.length > 0) {
          const coords = routeRes.data.routes[0].geometry.coordinates.map(
            (c) => [c[1], c[0]],
          );
          setRoutePath(coords);
        }
      }
    } catch (e) {
      console.error("Tracking/Routing error", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 3. Polling
  useEffect(() => {
    let interval;
    if (booking && booking.status === "accepted") {
      fetchDriverData();
      interval = setInterval(fetchDriverData, 15000);
    }
    return () => clearInterval(interval);
  }, [booking, startCoords]);

  // 4. Cancel Handler
  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this tow request?"))
      return;
    setIsCancelling(true);
    try {
      await dispatch(cancelTowTrip(booking?.id)).unwrap();
      dispatch(
        showNotification({ message: "Booking Cancelled", severity: "info" }),
      );
      dispatch(fetchMyTowBookings()); // Triggers parent update
    } catch (err) {
      dispatch(
        showNotification({ message: "Failed to cancel", severity: "error" }),
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const getMapBounds = () => {
    const points = [];
    if (towLocation) points.push([towLocation.lat, towLocation.lng]);
    if (startCoords) points.push([startCoords.lat, startCoords.lng]);
    if (endCoords) points.push([endCoords.lat, endCoords.lng]);
    return points.length > 0 ? points : null;
  };

  return (
    <Grid container spacing={2} direction="column">
      {/* TOP: MAP PANEL */}
      <Grid item xs={12} sx={{ p: 2 }}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            height: "20vh",
            minHeight: 200,
            position: "relative",
            bgcolor: "#e0e0e0", // Fallback color
            border: "4px solid white",
          }}
        >
          {booking?.status === "searching" ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "radial-gradient(circle, #ffffff 0%, #f0f0f0 100%)",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CircularProgress
                  size={80}
                  thickness={2}
                  sx={{ color: "#ccc" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RefreshIcon
                    className="spin-animation"
                    sx={{ color: "orange", fontSize: 40 }}
                  />
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{ mt: 3, fontWeight: "bold", color: "#555" }}
              >
                Finding nearest tow truck...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we connect you to a driver.
              </Typography>
            </Box>
          ) : (
            <MapContainer
              center={
                towLocation
                  ? [towLocation.lat, towLocation.lng]
                  : [20.5937, 78.9629]
              }
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <MapInvalidator />
              <MapRecenter bounds={getMapBounds()} />

              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              {/* DRIVER (Tow Truck) */}
              {towLocation && (
                <Marker
                  position={[towLocation.lat, towLocation.lng]}
                  icon={towTruckIcon}
                >
                  <Popup offset={[0, -20]}>
                    <Typography variant="body2" fontWeight="bold">
                      Tow Truck
                    </Typography>
                  </Popup>
                </Marker>
              )}

              {/* PICKUP (Broken Car) */}
              {startCoords && (
                <Marker
                  position={[startCoords.lat, startCoords.lng]}
                  icon={brokenCarIcon}
                >
                  <Popup offset={[0, -20]}>
                    <Typography variant="body2" fontWeight="bold">
                      Pickup Location
                    </Typography>
                  </Popup>
                </Marker>
              )}

              {/* DESTINATION (Garage) */}
              {endCoords && (
                <Marker
                  position={[endCoords.lat, endCoords.lng]}
                  icon={garageIcon}
                >
                  <Popup offset={[0, -20]}>
                    <Typography variant="body2" fontWeight="bold">
                      Garage/Destination
                    </Typography>
                  </Popup>
                </Marker>
              )}

              {/* ROUTE LINE */}
              {routePath.length > 0 && (
                <Polyline
                  positions={routePath}
                  color="#1976D2"
                  weight={6}
                  opacity={0.8}
                />
              )}
            </MapContainer>
          )}
        </Paper>
      </Grid>

      {/* BOTTOM: INFO PANEL */}
      <Grid item xs={12} sx={{ p: 2 }}>
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(to bottom right, #ffffff, #f9f9f9)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {booking?.status === "accepted" ? (
                <CheckCircleIcon color="success" sx={{ fontSize: 36 }} />
              ) : (
                <CircularProgress size={30} sx={{ color: "orange" }} />
              )}
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="800"
                  sx={{
                    lineHeight: 1.1,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  }}
                >
                  {booking?.status === "accepted" ? "En Route" : "Searching"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  TRIP #{booking?.id}
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Refresh Location">
              <IconButton
                onClick={fetchDriverData}
                disabled={isRefreshing || booking?.status !== "accepted"}
                sx={{ bgcolor: "white", boxShadow: 1 }}
              >
                <RefreshIcon
                  fontSize="small"
                  className={isRefreshing ? "spin-animation" : ""}
                />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Locations */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Pickup */}
            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <PlaceIcon sx={{ color: "#D32F2F", fontSize: 28 }} />
                <Box sx={{ width: 2, height: 40, bgcolor: "#eee", my: 0.5 }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  PICKUP POINT
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                  {booking?.start_location}
                </Typography>
              </Box>
            </Box>

            {/* Dropoff */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <PlaceIcon sx={{ color: "#388E3C", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  DESTINATION
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {booking?.end_location}
                </Typography>
              </Box>
            </Box>

            {/* Driver Details (If accepted) */}
            {booking?.status === "accepted" && booking?.tow_truck_driver && (
              <Paper
                variant="outlined"
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f8fdf8",
                  borderColor: "#c8e6c9",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  DRIVER DETAILS
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    component="img"
                    src={
                      booking?.tow_truck_driver.profile_picture_url ||
                      "https://cdn-icons-png.flaticon.com/512/3237/3237472.png"
                    }
                    sx={{
                      width: 45,
                      height: 45,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #fff",
                      boxShadow: 1,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {booking?.tow_truck_driver.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "text.secondary",
                      }}
                    >
                      <PhoneIcon fontSize="inherit" />
                      <Typography variant="caption">
                        {booking?.tow_truck_driver.phone_number}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    mt: 1.5,
                    bgcolor: "#e8f5e9",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    display: "inline-block",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {booking?.tow_truck_driver.vehicle_number}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>

          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={
              isCancelling ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CancelIcon />
              )
            }
            onClick={handleCancel}
            disabled={isCancelling}
            sx={{
              mt: 2,
              py: 1.2,
              borderRadius: 3,
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
            }}
          >
            {isCancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </Paper>
      </Grid>

      {/* CSS for Spin Animation */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-animation { animation: spin 2s linear infinite; }
      `}</style>
    </Grid>
  );
};

export default TowTrackingView;
