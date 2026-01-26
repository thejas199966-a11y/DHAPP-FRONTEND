import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Paper,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Fade,
  CircularProgress,
  Stack,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from "@mui/material";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import CommuteIcon from "@mui/icons-material/Commute";
import MapIcon from "@mui/icons-material/Map";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

// Components
import TripPlanner from "../components/TripPlanner";
import VehicleIcon from "../components/VehicleIcons";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../features/notificationSlice";
import { createTrip, fetchMyBookings, cancelTrip } from "../features/tripSlice";
import { useTranslation } from "react-i18next";

export default function BookDriver() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // --- REDUX STATE ---
  const { tripData } = useSelector((state) => state.user);
  const { bookings, status: bookingStatus } = useSelector(
    (state) => state.trips,
  );

  // --- LOCAL STATE ---
  const [activeBooking, setActiveBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form States
  const [hiringType, setHiringType] = useState(0);
  const [vehicleType, setVehicleType] = useState("SEDAN");
  const [shiftType, setShiftType] = useState("fixed");
  const [fixedHours, setFixedHours] = useState(8);
  const [flexiHours, setFlexiHours] = useState(4);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [reason, setReason] = useState("");

  // --- EFFECT: FETCH BOOKINGS & DETERMINE ACTIVE STATE ---
  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  useEffect(() => {
    // Find a trip that is either searching or accepted (not completed/cancelled)
    // Assuming backend returns sorted by date desc, the first one is likely the latest
    const active = bookings.find(
      (trip) => trip.status === "searching" || trip.status === "accepted",
    );
    setActiveBooking(active || null);
  }, [bookings]);

  // --- HANDLERS ---
  const handleHiringTypeChange = (event, newValue) => {
    setHiringType(newValue);
  };

  const handleShiftTypeChange = (event, newAlignment) => {
    if (newAlignment !== null) setShiftType(newAlignment);
  };

  const handleFixedHoursChange = (event, newAlignment) => {
    if (newAlignment !== null) setFixedHours(newAlignment);
  };

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const handleBookRequest = async () => {
    setIsProcessing(true);

    const typeMap = { 0: "Short Term", 1: "Monthly", 2: "Outstation" };
    let payload = {
      hiring_type: typeMap[hiringType],
      vehicle_type: vehicleType,
      reason: reason,
    };

    // Validation & Construction Logic
    if (hiringType === 2) {
      if (!tripData?.startPoint || !tripData?.destination) {
        dispatch(
          showNotification({
            message: "Please select start and destination.",
            severity: "warning",
          }),
        );
        setIsProcessing(false);
        return;
      }
      if (!tripData?.startDate || !tripData?.endDate) {
        dispatch(
          showNotification({
            message: "Please select dates in Trip Planner.",
            severity: "warning",
          }),
        );
        setIsProcessing(false);
        return;
      }
      payload.start_location = tripData.startPoint;
      payload.end_location = tripData.destination;
      payload.start_date = tripData.startDate;
      payload.end_date = tripData.endDate;
      payload.shift_details = "Outstation Trip";
    } else {
      if (!dates.start || !dates.end) {
        dispatch(
          showNotification({
            message: "Please select start and end dates.",
            severity: "warning",
          }),
        );
        setIsProcessing(false);
        return;
      }
      if (!reason.trim()) {
        dispatch(
          showNotification({
            message: "Please provide a reason.",
            severity: "warning",
          }),
        );
        setIsProcessing(false);
        return;
      }
      payload.start_date = dates.start;
      payload.end_date = dates.end;
      payload.start_location = "Local";
      payload.end_location = "Local";
      payload.shift_details =
        shiftType === "fixed"
          ? `${fixedHours} Hours/Day`
          : `${flexiHours} Hours/Day (Flexi)`;
    }

    try {
      const resultAction = await dispatch(createTrip(payload));
      if (createTrip.fulfilled.match(resultAction)) {
        dispatch(
          showNotification({
            message: "Booking Request Sent!",
            severity: "success",
          }),
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        dispatch(
          showNotification({
            message: resultAction.payload?.detail || "Booking failed.",
            severity: "error",
          }),
        );
      }
    } catch (error) {
      dispatch(
        showNotification({ message: "Unexpected error.", severity: "error" }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeBooking) return;
    if (
      window.confirm("Are you sure you want to cancel this booking request?")
    ) {
      setIsProcessing(true);
      try {
        const resultAction = await dispatch(cancelTrip(activeBooking.id));
        if (cancelTrip.fulfilled.match(resultAction)) {
          dispatch(
            showNotification({
              message: "Booking cancelled.",
              severity: "info",
            }),
          );
          setActiveBooking(null);
          setDates({ start: "", end: "" });
          setReason("");
        } else {
          dispatch(
            showNotification({
              message: "Failed to cancel.",
              severity: "error",
            }),
          );
        }
      } catch (e) {
        dispatch(
          showNotification({
            message: "Error cancelling trip.",
            severity: "error",
          }),
        );
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // --- SUB-COMPONENTS ---
  const VehicleSelection = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Select Vehicle Type
      </Typography>
      <Grid container spacing={1}>
        {["SEDAN", "SUV", "HATCHBACK", "LUXURY", "TEMPO", "MINIBUS", "BUS"].map(
          (type) => (
            <Grid item key={type}>
              <Paper
                elevation={vehicleType === type ? 4 : 1}
                onClick={() => setVehicleType(type)}
                sx={{
                  p: 1.5,
                  cursor: "pointer",
                  border:
                    vehicleType === type
                      ? `2px solid ${theme.palette.primary.main}`
                      : "2px solid transparent",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 80,
                  bgcolor:
                    vehicleType === type ? "primary.light" : "background.paper",
                  opacity: vehicleType === type ? 1 : 0.7,
                }}
              >
                <VehicleIcon type={type} height="30px" />
                <Typography variant="caption" fontWeight="bold" sx={{ mt: 1 }}>
                  {type}
                </Typography>
              </Paper>
            </Grid>
          ),
        )}
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h3"
          fontWeight="800"
          gutterBottom
          color="primary.main"
        >
          {activeBooking
            ? "Request Status"
            : t("book_driver.title") || "Book a Driver"}
        </Typography>
        {!activeBooking && (
          <Typography variant="h6" color="text.secondary">
            Select your hiring plan and get the best drivers in town.
          </Typography>
        )}
      </Box>

      {/* --- CONDITIONAL RENDERING: STATUS vs FORM --- */}
      {activeBooking ? (
        <Fade in={true}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              maxWidth: 800,
              mx: "auto",
              textAlign: "center",
              mb: 6,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              {activeBooking.status === "accepted" ? (
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
              ) : (
                <PendingActionsIcon
                  color="primary"
                  sx={{ fontSize: 80, mb: 2 }}
                />
              )}

              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {activeBooking.status === "accepted"
                  ? "Driver Assigned!"
                  : "Request Submitted"}
              </Typography>

              <Chip
                label={`ID: ${activeBooking.id}`}
                color="default"
                sx={{ mb: 2, fontWeight: "bold" }}
              />

              <Typography color="text.secondary" sx={{ maxWidth: 500, mb: 2 }}>
                We have received your request for a{" "}
                <strong>{activeBooking.vehicle_type}</strong> driver for{" "}
                <strong>{activeBooking.hiring_type}</strong>.
              </Typography>

              {activeBooking.driver && (
                <Alert
                  severity="success"
                  sx={{ mb: 3, width: "100%", maxWidth: 500 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Driver Details:
                  </Typography>
                  <Typography variant="body2">
                    {activeBooking.driver.name} (Rating:{" "}
                    {activeBooking.driver.rating}★)
                  </Typography>
                </Alert>
              )}
            </Box>

            <Stepper
              activeStep={activeBooking.status === "accepted" ? 2 : 1}
              alternativeLabel
              sx={{ mb: 5 }}
            >
              <Step key="Request Sent" completed>
                <StepLabel>Request Sent</StepLabel>
              </Step>
              <Step
                key="Processing"
                completed={activeBooking.status === "accepted"}
              >
                <StepLabel>Allocating Driver</StepLabel>
              </Step>
              <Step
                key="Driver Assigned"
                completed={activeBooking.status === "accepted"}
              >
                <StepLabel>Driver Assigned</StepLabel>
              </Step>
            </Stepper>

            <Divider sx={{ mb: 3 }} />

            <Grid
              container
              spacing={2}
              justifyContent="center"
              sx={{ mb: 4, textAlign: "left" }}
            >
              <Grid item xs={12} md={5}>
                <Typography variant="body2" color="text.secondary">
                  Dates
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {activeBooking.start_date} to {activeBooking.end_date}
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="body2" color="text.secondary">
                  Shift
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {activeBooking.shift_details || "Standard"}
                </Typography>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mb: 4, textAlign: "left" }}>
              {activeBooking.status === "accepted"
                ? "Your driver will contact you shortly."
                : "You will be notified once a driver accepts your request."}
            </Alert>

            <Button
              variant="outlined"
              color="error"
              startIcon={
                isProcessing ? <CircularProgress size={20} /> : <CancelIcon />
              }
              onClick={handleCancelRequest}
              disabled={isProcessing}
            >
              Cancel Request
            </Button>
          </Paper>
        </Fade>
      ) : (
        /* --- BOOKING FORM --- */
        <Paper
          elevation={3}
          sx={{ borderRadius: 3, overflow: "hidden", mb: 6 }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Tabs
              value={hiringType}
              onChange={handleHiringTypeChange}
              variant={isMobile ? "fullWidth" : "standard"}
              centered={!isMobile}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                icon={<CalendarMonthIcon />}
                label="Monthly"
                iconPosition="start"
              />
              <Tab
                icon={<AccessTimeIcon />}
                label="Short Term"
                iconPosition="start"
              />
              <Tab icon={<MapIcon />} label="Outstation" iconPosition="start" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Fade in={true} key={hiringType}>
              <Box>
                {hiringType === 2 && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <strong>Note:</strong> For outstation trips, a driver
                      allowance will be added to the final fare.
                    </Alert>
                    <TripPlanner />
                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleBookRequest}
                        disabled={isProcessing}
                        startIcon={
                          isProcessing ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <CommuteIcon />
                          )
                        }
                      >
                        {isProcessing
                          ? "Processing..."
                          : "Request Outstation Driver"}
                      </Button>
                    </Box>
                  </Box>
                )}

                {(hiringType === 0 || hiringType === 1) && (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <VehicleSelection />
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Shift Duration
                        </Typography>
                        <ToggleButtonGroup
                          value={shiftType}
                          exclusive
                          onChange={handleShiftTypeChange}
                          fullWidth
                          sx={{ mb: 2 }}
                        >
                          <ToggleButton value="flexi">
                            <AccessTimeIcon sx={{ mr: 1 }} /> Flexi / Hourly
                          </ToggleButton>
                          <ToggleButton value="fixed">
                            <WorkHistoryIcon sx={{ mr: 1 }} /> Full Shift
                          </ToggleButton>
                        </ToggleButtonGroup>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, bgcolor: "background.default" }}
                        >
                          {shiftType === "fixed" ? (
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Select standard shift duration:
                              </Typography>
                              <ToggleButtonGroup
                                value={fixedHours}
                                exclusive
                                onChange={handleFixedHoursChange}
                                color="primary"
                                fullWidth
                                size="small"
                              >
                                <ToggleButton value={8}>8 Hrs</ToggleButton>
                                <ToggleButton value={9}>9 Hrs</ToggleButton>
                                <ToggleButton value={10}>10 Hrs</ToggleButton>
                              </ToggleButtonGroup>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography variant="body2">
                                Hours/Day:
                              </Typography>
                              <TextField
                                type="number"
                                size="small"
                                value={flexiHours}
                                onChange={(e) => setFlexiHours(e.target.value)}
                                inputProps={{ min: 1, max: 24 }}
                                sx={{ width: 100 }}
                              />
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Select Dates
                        </Typography>
                        <Stack
                          direction={isMobile ? "column" : "row"}
                          spacing={2}
                        >
                          <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            name="start"
                            InputLabelProps={{ shrink: true }}
                            value={dates.start}
                            onChange={handleDateChange}
                          />
                          <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            name="end"
                            InputLabelProps={{ shrink: true }}
                            value={dates.end}
                            onChange={handleDateChange}
                          />
                        </Stack>
                        {hiringType === 1 && (
                          <Chip
                            label="Monthly hiring: Min 30 days"
                            color="info"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Main Reason
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="E.g., Office commute..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleBookRequest}
                        disabled={isProcessing}
                        startIcon={
                          isProcessing ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <CommuteIcon />
                          )
                        }
                        sx={{ height: 50, fontSize: "1.1rem" }}
                      >
                        {isProcessing ? "Processing..." : "Book Request"}
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Fade>
          </CardContent>
        </Paper>
      )}

      {/* --- PAST BOOKINGS SECTION --- */}
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HistoryIcon sx={{ mr: 1 }} /> Your Booking History
        </Typography>
        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <List>
            {bookings && bookings.length > 0 ? (
              bookings.map((trip) => (
                <React.Fragment key={trip.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor:
                            trip.status === "cancelled"
                              ? "error.light"
                              : trip.status === "completed"
                                ? "success.light"
                                : "primary.light",
                        }}
                      >
                        <DirectionsCarIcon color="inherit" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${trip.hiring_type} - ${trip.vehicle_type} (${trip.status.toUpperCase()})`}
                      secondary={`${trip.start_date} to ${trip.end_date} • ${trip.shift_details || "Standard"}`}
                    />
                    <Chip
                      label={trip.status}
                      color={
                        trip.status === "cancelled"
                          ? "error"
                          : trip.status === "completed"
                            ? "success"
                            : "primary"
                      }
                      size="small"
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No booking history found."
                  secondary="Your past and current bookings will appear here."
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}
