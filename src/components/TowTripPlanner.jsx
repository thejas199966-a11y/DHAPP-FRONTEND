import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  ClickAwayListener,
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
import axios from "axios";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import NavigationIcon from "@mui/icons-material/Navigation";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";

// Redux
import { useSelector, useDispatch } from "react-redux";
import { showNotification } from "../features/notificationSlice";

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
    top: "90px",
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

// --- SUB-COMPONENT: LOCATION AUTOCOMPLETE ---
const LocationAutocomplete = ({
  label,
  value,
  onChange,
  onSelect,
  onManualSearch,
  icon,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceTimeout = useRef(null);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      // Prioritize Bengaluru using viewbox, but strict check happens on selection
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&viewbox=77.3,13.2,77.9,12.8`,
      );
      setSuggestions(res.data);
      setOpen(true);
    } catch (error) {
      console.error("Autosuggest Error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", mb: 2 }}>
        <TextField
          fullWidth
          label={label}
          value={value}
          onChange={handleChange}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{icon}</InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    onManualSearch();
                    setOpen(false);
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {open && suggestions.length > 0 && (
          <Paper
            elevation={5}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1000,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <List dense>
              {suggestions.map((item, index) => (
                <ListItem
                  button
                  key={index}
                  onClick={() => handleSelect(item)}
                  divider
                >
                  <ListItemText
                    primary={item.display_name.split(",")[0]}
                    secondary={item.display_name}
                    secondaryTypographyProps={{
                      noWrap: true,
                      fontSize: "0.75rem",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default function TowTripPlanner({ onPlanChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  const { loading: locationLoading } = useSelector((state) => state.location);

  // Local State
  const [formData, setFormData] = useState({
    startPoint: "",
    destination: "",
    startCoords: null,
    endCoords: null,
    vehicleType: "CAR",
  });

  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default Bengaluru
  const [routePositions, setRoutePositions] = useState([]);

  const loading = locationLoading === "pending" || locationLoading === "idle";

  // --- VALIDATION LOGIC ---
  const isLocationInBengaluru = (data) => {
    // 1. Text Search (City/District)
    const addressString = JSON.stringify(data).toLowerCase();
    const keywords = ["bengaluru", "bangalore"];
    const hasKeyword = keywords.some((k) => addressString.includes(k));

    if (hasKeyword) return true;

    // 2. Coordinate Bounding Box (Lat 12.3-13.5, Lng 77.0-78.2)
    const lat = parseFloat(data.lat);
    const lon = parseFloat(data.lon);

    if (lat >= 12.3 && lat <= 13.5 && lon >= 77.0 && lon <= 78.2) {
      return true;
    }
    return false;
  };

  const showRestrictionAlert = () => {
    dispatch(
      showNotification({
        message: "Service available only within Bengaluru District.",
        severity: "error",
      }),
    );
  };

  // --- SYNC WITH PARENT ---
  useEffect(() => {
    onPlanChange(formData);
  }, [formData, onPlanChange]);

  // --- INITIAL GEOLOCATION ---
  useEffect(() => {
    if (navigator.geolocation && !formData.startCoords) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          try {
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            );

            // STRICT CHECK: Only auto-fill if within Bengaluru
            if (
              isLocationInBengaluru({
                ...res.data,
                lat: latitude,
                lon: longitude,
              })
            ) {
              setMapCenter([latitude, longitude]);
              setFormData((prev) => ({
                ...prev,
                startCoords: { lat: latitude, lng: longitude },
                startPoint: res.data.display_name,
              }));
            } else {
              showRestrictionAlert();
              // Do not set startCoords, just center map to Bengaluru
              setMapCenter([12.9716, 77.5946]);
            }
          } catch (e) {
            setMapCenter([12.9716, 77.5946]);
          }
        },
        (err) => console.log("Geolocation error:", err),
      );
    }
  }, []);

  // --- ROUTING LOGIC ---
  const fetchRoute = async (start, end) => {
    if (!start || !end) return;

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const res = await axios.get(url);

      if (res.data.routes && res.data.routes.length > 0) {
        const coordinates = res.data.routes[0].geometry.coordinates.map(
          (coord) => [coord[1], coord[0]],
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

  // --- HANDLERS (STRICT UPDATES) ---

  const handleManualSearch = async (type) => {
    const query = type === "start" ? formData.startPoint : formData.destination;
    if (!query) return;

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1`,
      );
      if (res.data.length > 0) {
        const item = res.data[0];

        // STRICT CHECK
        if (!isLocationInBengaluru(item)) {
          showRestrictionAlert();
          // Clear invalid data to prevent booking
          if (type === "start") {
            setFormData((prev) => ({
              ...prev,
              startPoint: "",
              startCoords: null,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              destination: "",
              endCoords: null,
            }));
          }
          return;
        }

        const newCoords = {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
        if (type === "start") {
          setFormData((prev) => ({
            ...prev,
            startCoords: newCoords,
            startPoint: item.display_name,
          }));
          setMapCenter([newCoords.lat, newCoords.lng]);
        } else {
          setFormData((prev) => ({
            ...prev,
            endCoords: newCoords,
            destination: item.display_name,
          }));
        }
      } else {
        dispatch(
          showNotification({
            message: "Location not found!",
            severity: "warning",
          }),
        );
      }
    } catch (e) {
      dispatch(
        showNotification({
          message: "Error searching location",
          severity: "error",
        }),
      );
    }
  };

  const handleStartSelect = (item) => {
    if (!isLocationInBengaluru(item)) {
      showRestrictionAlert();
      setFormData((prev) => ({ ...prev, startPoint: "", startCoords: null })); // Explicitly clear
      return;
    }
    const coords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
    setFormData((prev) => ({
      ...prev,
      startPoint: item.display_name,
      startCoords: coords,
    }));
    setMapCenter([coords.lat, coords.lng]);
  };

  const handleDestSelect = (item) => {
    if (!isLocationInBengaluru(item)) {
      showRestrictionAlert();
      setFormData((prev) => ({ ...prev, destination: "", endCoords: null })); // Explicitly clear
      return;
    }
    const coords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
    setFormData((prev) => ({
      ...prev,
      destination: item.display_name,
      endCoords: coords,
    }));
  };

  // --- MARKER DRAG (STRICT) ---
  const handleMarkerDrag = async (e, type) => {
    const { lat, lng } = e.target.getLatLng();
    const newCoords = { lat, lng };

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      );

      // STRICT CHECK
      if (!isLocationInBengaluru({ ...res.data, lat, lon: lng })) {
        showRestrictionAlert();
        // Do not update coords if outside bounds
        return;
      }

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
      // Do nothing on error
    }
  };

  const onStartDrag = useMemo(
    () => ({ dragend: (e) => handleMarkerDrag(e, "start") }),
    [],
  );
  const onEndDrag = useMemo(
    () => ({ dragend: (e) => handleMarkerDrag(e, "end") }),
    [],
  );

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: 3, mb: 2, mx: isMobile ? 0 : 2, px: isMobile ? 1 : 2 }}
    >
      <Grid
        container
        spacing={2}
        sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}
      >
        {/* FORM PANEL */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
            {loading ? (
              <Box sx={{ height: "100%" }}>
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  width="100%"
                  sx={{ mb: 3 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  width="100%"
                  sx={{ mb: 3 }}
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
                  <NavigationIcon sx={{ mr: 1, color: "#1976d2" }} /> Plan
                  Towing
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <LocationAutocomplete
                    label="Pickup Location"
                    value={formData.startPoint}
                    // IMPORTANT: Clear coords on text change to prevent stale valid coords
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        startPoint: val,
                        startCoords: null,
                      }))
                    }
                    onSelect={handleStartSelect}
                    onManualSearch={() => handleManualSearch("start")}
                    icon={<MyLocationIcon color="success" />}
                  />

                  <LocationAutocomplete
                    label="Destination / Garage"
                    value={formData.destination}
                    // IMPORTANT: Clear coords on text change
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        destination: val,
                        endCoords: null,
                      }))
                    }
                    onSelect={handleDestSelect}
                    onManualSearch={() => handleManualSearch("end")}
                    icon={<FmdGoodIcon color="error" />}
                  />

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mt: 3, mb: 1 }}
                  >
                    Vehicle Type
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        flex: 1,
                        cursor: "pointer",
                        bgcolor:
                          formData.vehicleType === "CAR" ? "#e3f2fd" : "white",
                        borderColor:
                          formData.vehicleType === "CAR"
                            ? "#2196f3"
                            : "divider",
                        borderWidth: formData.vehicleType === "CAR" ? 2 : 1,
                      }}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, vehicleType: "CAR" }))
                      }
                    >
                      <CardContent
                        sx={{
                          p: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <DirectionsCarIcon
                          color={
                            formData.vehicleType === "CAR"
                              ? "primary"
                              : "action"
                          }
                        />
                        <Typography variant="caption" fontWeight="bold">
                          Car
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card
                      variant="outlined"
                      sx={{
                        flex: 1,
                        cursor: "pointer",
                        bgcolor:
                          formData.vehicleType === "BIKE" ? "#e3f2fd" : "white",
                        borderColor:
                          formData.vehicleType === "BIKE"
                            ? "#2196f3"
                            : "divider",
                        borderWidth: formData.vehicleType === "BIKE" ? 2 : 1,
                      }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicleType: "BIKE",
                        }))
                      }
                    >
                      <CardContent
                        sx={{
                          p: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <TwoWheelerIcon
                          color={
                            formData.vehicleType === "BIKE"
                              ? "primary"
                              : "action"
                          }
                        />
                        <Typography variant="caption" fontWeight="bold">
                          Bike
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* MAP PANEL */}
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
                      <Popup>Pickup Point</Popup>
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
