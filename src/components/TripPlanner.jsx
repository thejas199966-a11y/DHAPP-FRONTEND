import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Box,
  InputAdornment,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import NavigationIcon from "@mui/icons-material/Navigation";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";

// Redux & Axios
import { useSelector, useDispatch } from "react-redux";
import { showNotification } from "../features/notificationSlice";
import { setTripData } from "../features/userSlice";
import axios from "axios";

// --- LEAFLET ICON SETUP ---
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const greenIcon = new L.Icon({
  ...DefaultIcon.options,
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
});
const redIcon = new L.Icon({
  ...DefaultIcon.options,
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
});

// --- SUB-COMPONENT: MAP CONTROLLER ---
const MapController = ({ center, routeBounds }) => {
  const map = useMap();

  useEffect(() => {
    if (routeBounds && routeBounds.length > 0) {
      map.fitBounds(routeBounds, { padding: [50, 50] });
    }
  }, [routeBounds, map]);

  useEffect(() => {
    if (center && (!routeBounds || routeBounds.length === 0)) {
      map.flyTo(center, 13);
    }
  }, [center, routeBounds, map]);

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};

const RecenterControl = ({
  mapCenter,
  startCoords,
  endCoords,
  routePositions,
}) => {
  const map = useMap();

  const handleRecenter = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (routePositions && routePositions.length > 0) {
      map.fitBounds(routePositions, { padding: [50, 50] });
    } else if (startCoords && endCoords) {
      const bounds = L.latLngBounds([
        [startCoords.lat, startCoords.lng],
        [endCoords.lat, endCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (startCoords) {
      map.flyTo([startCoords.lat, startCoords.lng], 13);
    } else {
      map.flyTo(mapCenter, 13);
    }
  };

  const controlStyle = {
    position: "absolute",
    top: "90px", // Below zoom controls
    left: "10px",
    zIndex: 1000,
  };

  return (
    <div style={controlStyle}>
      <Paper elevation={4}>
        <IconButton onClick={handleRecenter} title="Recenter map">
          <GpsFixedIcon />
        </IconButton>
      </Paper>
    </div>
  );
};

export default function TripPlanner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  const { tripData } = useSelector((state) => state.user);
  const {
    initialLocation,
    initialAddress,
    loading: locationLoading,
    error: locationError,
  } = useSelector((state) => state.location);

  const [formData, setFormData] = useState({
    startPoint: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    startCoords: null,
    endCoords: null,
    ...tripData,
  });

  // Map State
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [routePositions, setRoutePositions] = useState([]);
  const loading = locationLoading === "pending" || locationLoading === "idle";

  useEffect(() => {
    if (locationError) {
      dispatch(
        showNotification({
          message: locationError,
          severity: "info",
        })
      );
    }
    if (initialLocation && initialAddress) {
      setMapCenter([initialLocation.lat, initialLocation.lng]);
      setFormData((prev) => ({
        ...prev,
        startCoords: initialLocation,
        startPoint: initialAddress,
      }));
    }
  }, [initialLocation, initialAddress, locationError]);

  useEffect(() => {
    dispatch(setTripData(formData));
  }, [formData]);

  const fetchRoute = async (start, end) => {
    if (!start || !end) return;

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const res = await axios.get(url);

      if (res.data.routes && res.data.routes.length > 0) {
        const coordinates = res.data.routes[0].geometry.coordinates.map(
          (coord) => [coord[1], coord[0]]
        );
        setRoutePositions(coordinates);
      }
    } catch (error) {
      console.error("Routing Error:", error);
    }
  };

  useEffect(() => {
    if (formData.startCoords && formData.endCoords) {
      fetchRoute(formData.startCoords, formData.endCoords);
    } else {
      setRoutePositions([]);
    }
  }, [formData.startCoords, formData.endCoords]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchLocation = async (type) => {
    const query = type === "start" ? formData.startPoint : formData.destination;
    if (!query) return;

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };

        if (type === "start") {
          setFormData((prev) => ({ ...prev, startCoords: newCoords }));
          setMapCenter([newCoords.lat, newCoords.lng]);
        } else {
          setFormData((prev) => ({ ...prev, endCoords: newCoords }));
        }
      } else {
        dispatch(
          showNotification({
            message: "Location not found!",
            severity: "warning",
          })
        );
      }
    } catch (e) {
      dispatch(
        showNotification({
          message: "Error searching location",
          severity: "error",
        })
      );
    }
  };

  const handleMarkerDrag = async (e, type) => {
    const { lat, lng } = e.target.getLatLng();
    const newCoords = { lat, lng };

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const address = res.data.display_name;
      if (type === "start") {
        setFormData((prev) => ({
          ...prev,
          startCoords: newCoords,
          startPoint: address,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          endCoords: newCoords,
          destination: address,
        }));
      }
    } catch (error) {
      // console.error("Reverse Geocode Error", error);
      if (type === "start") {
        setFormData((prev) => ({ ...prev, startCoords: newCoords }));
      } else {
        setFormData((prev) => ({ ...prev, endCoords: newCoords }));
      }
    }
  };

  const onStartDrag = useMemo(
    () => ({ dragend: (e) => handleMarkerDrag(e, "start") }),
    []
  );
  const onEndDrag = useMemo(
    () => ({ dragend: (e) => handleMarkerDrag(e, "end") }),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const invalidForm = Object.entries(formData).some(([key, value]) => {
      if (!value) {
        dispatch(
          showNotification({
            message: `Please fill in the ${key} field.`,
            severity: "warning",
          })
        );
        return true;
      }
      return false;
    });

    if (invalidForm) return;

    if (!formData.startCoords || !formData.endCoords) {
      dispatch(
        showNotification({
          message:
            "Please ensure both start point and destination are set correctly.",
          severity: "warning",
        })
      );
      return;
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 3,
        mb: 2,
        mx: isMobile ? 0 : 2,
        px: isMobile ? 1 : 2,
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}
      >
        {/* --- LEFT PANEL: FORM --- */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
            {/* 3. CONDITIONAL RENDERING: SKELETON VS FORM */}
            {loading ? (
              <Box sx={{ height: "100%" }}>
                {/* Header Skeleton */}
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />

                {/* Input Skeletons */}
                <Skeleton
                  variant="rectangular"
                  height={56}
                  width={600}
                  sx={{ mb: 3, borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  width={600}
                  sx={{ mb: 3, borderRadius: 1 }}
                />

                {/* Dates Skeleton (Grid) */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Skeleton
                      variant="rectangular"
                      height={56}
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Skeleton
                      variant="rectangular"
                      height={56}
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                </Grid>

                {/* Travelers Skeleton */}
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ mb: 3, borderRadius: 1 }}
                />

                {/* Button Skeleton */}
                <Skeleton
                  variant="rectangular"
                  height={50}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            ) : (
              <>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <NavigationIcon sx={{ mr: 1, color: "#1976d2" }} /> Plan Trip
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Start Point"
                    name="startPoint"
                    value={formData.startPoint}
                    onChange={handleInputChange}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MyLocationIcon color="success" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleSearchLocation("start")}
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FmdGoodIcon color="error" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleSearchLocation("end")}
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Start"
                        name="startDate"
                        InputLabelProps={{ shrink: true }}
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="End"
                        name="endDate"
                        InputLabelProps={{ shrink: true }}
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    type="number"
                    label="Travelers"
                    name="travelers"
                    margin="normal"
                    value={formData.travelers}
                    onChange={handleInputChange}
                    inputProps={{ min: 1 }}
                  />
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* --- RIGHT PANEL: MAP --- */}
        <Grid item xs={12} md={8} sx={!isMobile ? { minWidth: "500px" } : {}}>
          <Paper
            elevation={3}
            sx={{
              height: isMobile ? "50vh" : "60vh",
              width: "100%",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* 4. CONDITIONAL RENDERING: SKELETON VS MAP */}
            {loading ? (
              <Skeleton
                variant="rectangular"
                width="100%"
                height="100%"
                animation="wave"
                sx={{ bgcolor: "grey.200" }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}
              >
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController
                    center={mapCenter}
                    routeBounds={routePositions}
                  />

                  <RecenterControl
                    mapCenter={mapCenter}
                    startCoords={formData.startCoords}
                    endCoords={formData.endCoords}
                    routePositions={routePositions}
                  />

                  {routePositions.length > 0 && (
                    <Polyline
                      positions={routePositions}
                      color="blue"
                      weight={5}
                      opacity={0.7}
                    />
                  )}

                  {formData.startCoords && (
                    <Marker
                      position={[
                        formData.startCoords.lat,
                        formData.startCoords.lng,
                      ]}
                      draggable={true}
                      eventHandlers={onStartDrag}
                      icon={greenIcon}
                    >
                      <Popup>Start</Popup>
                    </Marker>
                  )}
                  {formData.endCoords && (
                    <Marker
                      position={[
                        formData.endCoords.lat,
                        formData.endCoords.lng,
                      ]}
                      draggable={true}
                      eventHandlers={onEndDrag}
                      icon={redIcon}
                    >
                      <Popup>Destination</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
