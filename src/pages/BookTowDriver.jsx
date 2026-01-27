import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

// Actions
import { createTowTrip, fetchMyTowBookings } from "../features/towTripSlice";
import { showNotification } from "../features/notificationSlice";

// Components
import TripPlanner from "../components/TripPlanner";
import TowTrackingView from "../components/TowTrackingView"; // New Component

// Icons
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

export default function BookTowDriver() {
  const dispatch = useDispatch();

  const { tripData } = useSelector((state) => state.user);
  const { bookings: towBookings } = useSelector((state) => state.towTrips);

  const [vehicleType, setVehicleType] = useState("CAR");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  // 1. Fetch My Tow Bookings
  useEffect(() => {
    dispatch(fetchMyTowBookings());
  }, [dispatch]);

  // 2. Determine Active Booking
  useEffect(() => {
    const active = towBookings.find(
      (trip) =>
        trip.status === "searching" ||
        trip.status === "accepted" ||
        trip.status === "in_progress",
    );
    setActiveBooking(active || null);
  }, [towBookings]);

  // Handler: Create Booking
  const handleBook = async () => {
    if (!tripData?.startPoint || !tripData?.destination) {
      dispatch(
        showNotification({ message: "Select locations", severity: "warning" }),
      );
      return;
    }

    setIsProcessing(true);
    const payload = {
      hiring_type: "Tow Service",
      vehicle_type: vehicleType,
      start_location: tripData.startPoint,
      end_location: tripData.destination,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      reason: "Vehicle Breakdown",
    };

    try {
      await dispatch(createTowTrip(payload)).unwrap();
      dispatch(
        showNotification({ message: "Tow Requested!", severity: "success" }),
      );
      dispatch(fetchMyTowBookings());
    } catch (err) {
      dispatch(
        showNotification({ message: "Request failed", severity: "error" }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8, px: { xs: 2, md: 5 } }}>
      <Typography
        variant="h3"
        fontWeight="900"
        gutterBottom
        align="center"
        sx={{ mb: 6, letterSpacing: "-1px" }}
      >
        {activeBooking ? "Live Tow Tracking" : "Book a Tow Truck"}
      </Typography>

      {activeBooking ? (
        // RENDER TRACKING VIEW
        <TowTrackingView booking={activeBooking} />
      ) : (
        // RENDER BOOKING FORM
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            maxWidth: "1000px",
            mx: "auto",
            background: "linear-gradient(to bottom, #ffffff, #fafafa)",
          }}
        >
          <TripPlanner />

          <Grid container spacing={4} sx={{ mt: 3 }}>
            <Grid item xs={12} md={7}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                color="text.secondary"
              >
                SELECT VEHICLE TYPE
              </Typography>
              <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                <Card
                  variant="outlined"
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    bgcolor: vehicleType === "CAR" ? "#e3f2fd" : "white",
                    borderColor: vehicleType === "CAR" ? "#2196f3" : "divider",
                    borderWidth: vehicleType === "CAR" ? 2 : 1,
                    boxShadow: vehicleType === "CAR" ? 4 : 0,
                    transform:
                      vehicleType === "CAR" ? "scale(1.02)" : "scale(1)",
                  }}
                  onClick={() => setVehicleType("CAR")}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 3,
                    }}
                  >
                    <DirectionsCarIcon
                      sx={{
                        fontSize: 50,
                        color: vehicleType === "CAR" ? "#1976d2" : "gray",
                      }}
                    />
                    <Typography
                      variant="button"
                      sx={{ mt: 2, fontWeight: "bold" }}
                    >
                      Car / SUV
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    bgcolor: vehicleType === "BIKE" ? "#e3f2fd" : "white",
                    borderColor: vehicleType === "BIKE" ? "#2196f3" : "divider",
                    borderWidth: vehicleType === "BIKE" ? 2 : 1,
                    boxShadow: vehicleType === "BIKE" ? 4 : 0,
                    transform:
                      vehicleType === "BIKE" ? "scale(1.02)" : "scale(1)",
                  }}
                  onClick={() => setVehicleType("BIKE")}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 3,
                    }}
                  >
                    <TwoWheelerIcon
                      sx={{
                        fontSize: 50,
                        color: vehicleType === "BIKE" ? "#1976d2" : "gray",
                      }}
                    />
                    <Typography
                      variant="button"
                      sx={{ mt: 2, fontWeight: "bold" }}
                    >
                      Bike
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={5}
              sx={{ display: "flex", alignItems: "flex-end" }}
            >
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleBook}
                disabled={isProcessing}
                sx={{
                  bgcolor: "black",
                  color: "white",
                  py: 2.5,
                  borderRadius: 3,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                  "&:hover": { bgcolor: "#333", transform: "translateY(-2px)" },
                  transition: "all 0.3s",
                }}
              >
                {isProcessing ? (
                  <CircularProgress size={28} color="inherit" />
                ) : (
                  "REQUEST NOW"
                )}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
}
