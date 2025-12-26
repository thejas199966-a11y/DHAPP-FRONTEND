import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setLocation, setLoadingLocation } from "../features/commonSlice";
import LocationDialog from "../components/LocationDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { location } = useSelector((state) => state.common);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // These hooks return true if the screen matches the size
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Phones
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // Tablets

  const items = [
    {
      img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1000&q=80",
      title: "Luxury Travel",
    },
    {
      img: "https://images.unsplash.com/photo-1533473359331-0135ef1bcfb0?auto=format&fit=crop&w=1000&q=80",
      title: "Safe Drivers",
    },
  ];

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    dispatch(setLoadingLocation());
    setDialogOpen(false); // Close dialog if open

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap (Nominatim) Free API for Reverse Geocoding
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const response = await axios.get(url);

          const address = response.data.address;
          // Extract city (Nominatim keys vary: city, town, village, county)
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            "Unknown Location";
          const state = address.state;

          dispatch(
            setLocation({
              city: city,
              state: state,
              coordinates: { lat: latitude, lng: longitude },
              isManual: false,
            })
          );
        } catch (error) {
          console.error("Error fetching city name:", error);
          dispatch(
            setLocation({
              city: "Bengaluru",
              state: "Karnataka",
              isManual: false,
            })
          );
        }
      },
      (error) => {
        console.error("Geolocation denied:", error);
        // Default fallback if user denies permission
        dispatch(
          setLocation({ city: "Select Location", state: "", isManual: false })
        );
      }
    );
  };

  useEffect(() => {
    // Only detect if we haven't set it yet (or if it's the default 'Detecting...')
    if (location.city === "Detecting...") {
      detectLocation();
    }
  }, []);

  const handleManualSelect = (city, state) => {
    dispatch(
      setLocation({
        city: city,
        state: state,
        isManual: true,
      })
    );
    setDialogOpen(false);
  };

  return (
    // maxWidth="xl" allows it to be wider on large screens, but constrained on huge monitors
    // disableGutters={isMobile} removes side padding on very small phones so it fits better
    <Container
      maxWidth="xl"
      disableGutters={isMobile}
      sx={{ mt: isMobile ? 0 : 4, mb: 8, px: isMobile ? 0 : 2 }}
    >
      {/* 1. Hero / Carousel Section */}
      <Card
        sx={{
          borderRadius: isMobile ? 0 : 4, // Square corners on mobile, rounded on desktop
          boxShadow: 3,
          mb: 4,
          overflow: "hidden",
        }}
      >
        <Carousel animation="slide" interval={4000} indicators={false}>
          {items.map((item, i) => (
            <Box key={i} position="relative">
              <CardMedia
                component="img"
                // Height changes based on device: Mobile(250), Tablet(350), Desktop(450)
                height={isMobile ? "250" : isTablet ? "350" : "450"}
                image={item.img}
                alt={item.title}
                sx={{ objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  bgcolor: "rgba(0, 0, 0, 0.4)", // Dark gradient overlay for text readability
                  p: 2,
                }}
              >
                <Typography
                  variant={isMobile ? "h5" : "h3"} // Smaller font on mobile
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  {item.title}
                </Typography>
              </Box>
            </Box>
          ))}
        </Carousel>
      </Card>

      {/* --- LOCATION SECTION --- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          p: 2,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <LocationOnIcon color="error" sx={{ mr: 1, fontSize: 30 }} />

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Current Location
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1 }}>
            {location.city} {location.state && `, ${location.state}`}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 5, textTransform: "none" }}
        >
          Change
        </Button>
      </Box>

      {/* --- Dialog Component --- */}
      <LocationDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleManualSelect}
        onAutoDetect={detectLocation}
      />

      {/* 2. Action Buttons Section */}
      <Container maxWidth="lg">
        <Typography
          variant={isMobile ? "h5" : "h4"}
          align="center"
          gutterBottom
          sx={{ mb: 4, fontWeight: "medium", px: 2 }}
        >
          {t("dashboard.welcome")}
        </Typography>

        <Grid
          container
          spacing={isMobile ? 2 : 4}
          justifyContent="center"
          sx={{ px: isMobile ? 2 : 0 }}
        >
          {/* xs={12} = Full width on Mobile
             md={6} = Half width on Desktop/Tablet landscape
          */}
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/book-travel")}
              sx={{
                height: isMobile ? 60 : 90, // Taller buttons on desktop
                fontSize: isMobile ? "1rem" : "1.4rem",
                borderRadius: 3,
                textTransform: "none",
                backgroundColor: "#2f34cfff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: 6,
                "&:hover .arrow-icon": {
                  transform: "translateX(10px)",
                },
              }}
            >
              {t("dashboard.book_travel")}
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  opacity: 0.8,
                  fontSize: "0.7rem",
                }}
              >
                {t("dashboard.sub_travel")}
              </Typography>
              <ArrowForwardIcon
                className="arrow-icon"
                sx={{ transition: "transform 0.3s ease", mt: 0.5 }}
              />
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/book-driver")}
              sx={{
                height: isMobile ? 60 : 90,
                fontSize: isMobile ? "1rem" : "1.4rem",
                borderRadius: 3,
                textTransform: "none",
                backgroundColor: "#2f34cfff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: 6,
                "&:hover .arrow-icon": {
                  transform: "translateX(10px)",
                },
              }}
            >
              {t("dashboard.book_driver")}
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  opacity: 0.8,
                  fontSize: "0.7rem",
                }}
              >
                {t("dashboard.sub_driver")}
              </Typography>
              <ArrowForwardIcon
                className="arrow-icon"
                sx={{ transition: "transform 0.3s ease", mt: 0.5 }}
              />
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Dashboard;
