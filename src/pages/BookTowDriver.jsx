import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

// Actions
import { createTowTrip, fetchMyTowBookings } from "../features/towTripSlice";
import { showNotification } from "../features/notificationSlice";

// Components
import TowTripPlanner from "../components/TowTripPlanner";
import TowTrackingView from "../components/TowTrackingView";
import { useMemo } from "react";
import { useCallback } from "react";

export default function BookTowDriver() {
  const dispatch = useDispatch();
  const theme = useTheme();

  const { bookings: towBookings } = useSelector((state) => state.towTrips);

  const [isProcessing, setIsProcessing] = useState(false);

  // Local State
  const [plannerData, setPlannerData] = useState({
    startPoint: "",
    destination: "",
    startCoords: null,
    endCoords: null,
    vehicleType: "CAR",
  });

  // Check if form is valid (strict check for coordinates)
  const isValid =
    plannerData.startCoords !== null &&
    plannerData.endCoords !== null &&
    plannerData.startPoint.length > 0 &&
    plannerData.destination.length > 0;

  useEffect(() => {
    dispatch(fetchMyTowBookings());
  }, [dispatch]);

  const activeBooking = useMemo(() => {
    return (
      towBookings?.find(
        (trip) =>
          trip.status === "searching" ||
          trip.status === "accepted" ||
          trip.status === "in_progress",
      ) || null
    );
  }, [towBookings]);

  const handlePlanChange = useCallback((data) => {
    setPlannerData(data);
  }, []);

  const handleBook = async () => {
    if (!isValid) {
      dispatch(
        showNotification({
          message: "Please select valid Bengaluru locations.",
          severity: "warning",
        }),
      );
      return;
    }

    setIsProcessing(true);
    const payload = {
      hiring_type: "Tow Service",
      vehicle_type: plannerData.vehicleType,
      start_location: plannerData.startPoint,
      end_location: plannerData.destination,
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
        <TowTrackingView booking={activeBooking} />
      ) : (
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            maxWidth: "1100px",
            mx: "auto",
            background: "linear-gradient(to bottom, #ffffff, #fafafa)",
          }}
        >
          <TowTripPlanner onPlanChange={handlePlanChange} />

          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid
              item
              xs={12}
              md={7}
              sx={{ display: { xs: "none", md: "block" } }}
            ></Grid>
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
                disabled={isProcessing || !isValid}
                sx={{
                  bgcolor: "black",
                  color: "white",
                  py: 2.5,
                  borderRadius: 3,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                  "&:hover": { bgcolor: "#333", transform: "translateY(-2px)" },
                  "&:disabled": { bgcolor: "#ccc", cursor: "not-allowed" },
                  transition: "all 0.3s",
                }}
              >
                {isProcessing ? (
                  <CircularProgress size={28} color="inherit" />
                ) : (
                  "REQUEST TOW TRUCK"
                )}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
}
