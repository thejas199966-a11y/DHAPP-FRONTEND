import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
  Skeleton,
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

// Redux & Axios
import { useSelector, useDispatch } from "react-redux";
import { showNotification } from "../features/notificationSlice";
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

export default function BookTravel() {
  const { location: currentLocation } = useSelector((state) => state.common);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    startPoint: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
  });

  // Map State
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [routePositions, setRoutePositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPreciseLocation = () => {
      if (!navigator.geolocation) {
        dispatch(showNotification({ message: "Geolocation is not supported by your browser", severity: "error" }));
        setLoading(false);
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const userCoords = { lat: latitude, lng: longitude };
          setStartCoords(userCoords);
          setMapCenter([latitude, longitude]);

          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
            const res = await axios.get(url);
            const exactAddress = res.data.display_name;

            setFormData((prev) => ({
              ...prev,
              startPoint: exactAddress,
            }));
          } catch (error) {
            console.error("Error finding address:", error);
            setFormData((prev) => ({
              ...prev,
              startPoint: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            }));
          }
          setLoading(false);
        },
        (error) => {
          console.error("Location denied or error:", error);
          if (currentLocation && currentLocation.coordinates) {
            const { lat, lng } = currentLocation.coordinates;
            setStartCoords({ lat, lng });
            setMapCenter([lat, lng]);
            setFormData((prev) => ({
              ...prev,
              startPoint: `${currentLocation.city}, ${currentLocation.state}`,
            }));
          }
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    getPreciseLocation();
  }, []);

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
    if (startCoords && endCoords) {
      fetchRoute(startCoords, endCoords);
    } else {
      setRoutePositions([]);
    }
  }, [startCoords, endCoords]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
          setStartCoords(newCoords);
          setMapCenter([newCoords.lat, newCoords.lng]);
        } else {
          setEndCoords(newCoords);
        }
      } else {
        dispatch(showNotification({ message: "Location not found!", severity: "warning" }));
      }
    } catch (e) {
      dispatch(showNotification({ message: "Error searching location", severity: "error" }));
    }
  };

  const handleMarkerDrag = async (e, type) => {
    const { lat, lng } = e.target.getLatLng();
    if (type === "start") setStartCoords({ lat, lng });
    else setEndCoords({ lat, lng });

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const address = res.data.display_name;
      if (type === "start")
        setFormData((prev) => ({ ...prev, startPoint: address }));
      else setFormData((prev) => ({ ...prev, destination: address }));
    } catch (error) {
      console.error("Reverse Geocode Error", error);
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
        dispatch(showNotification({ message: `Please fill in the ${key} field.`, severity: "warning" }));
        return true;
      }
      return false;
    });

    if (invalidForm) return;

    if (!startCoords || !endCoords) {
      dispatch(showNotification({ message: "Please ensure both start point and destination are set correctly.", severity: "warning" }));
      return;
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 3,
        mb: 3,
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid container spacing={2} sx={{ flexGrow: 1, height: "100%" }}>
        {/* --- LEFT PANEL: FORM --- */}
        <Grid item xs={12} md={4} sx={{ height: "100%" }}>
          <Paper elevation={3} sx={{ p: 3, height: "100%", overflowY: "auto" }}>
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
                  sx={{ mb: 4, borderRadius: 1 }}
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

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 4 }}
                  >
                    BOOK TRIP
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* --- RIGHT PANEL: MAP --- */}
        <Grid item xs={12} md={8} sx={{ height: "100%", minWidth: "500px" }}>
          <Paper
            elevation={3}
            sx={{
              height: "100%",
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

                  {routePositions.length > 0 && (
                    <Polyline
                      positions={routePositions}
                      color="blue"
                      weight={5}
                      opacity={0.7}
                    />
                  )}

                  {startCoords && (
                    <Marker
                      position={[startCoords.lat, startCoords.lng]}
                      draggable={true}
                      eventHandlers={onStartDrag}
                      icon={greenIcon}
                    >
                      <Popup>Start</Popup>
                    </Marker>
                  )}
                  {endCoords && (
                    <Marker
                      position={[endCoords.lat, endCoords.lng]}
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
