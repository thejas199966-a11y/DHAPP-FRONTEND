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
  IconButton,
  Pagination,
  Collapse,
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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
  const { bookings } = useSelector((state) => state.trips);

  // --- LOCAL STATE ---
  const [activeBooking, setActiveBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form States
  const [hiringType, setHiringType] = useState(0); // 0: Short Term, 1: Monthly, 2: Outstation
  const [vehicleType, setVehicleType] = useState("SEDAN");
  const [shiftType, setShiftType] = useState("fixed");
  const [fixedHours, setFixedHours] = useState(8);
  const [flexiHours, setFlexiHours] = useState(2);
  const [startTime, setStartTime] = useState("09:00");
  const [reason, setReason] = useState("");

  // Custom Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]); // For Short Term/Monthly (Array of strings)
  const [dateRange, setDateRange] = useState({ start: null, end: null }); // For Outstation (Range Object)

  // History State
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const historyItemsPerPage = 3;

  // --- EFFECT: FETCH BOOKINGS & DETERMINE ACTIVE STATE ---
  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  useEffect(() => {
    const active = bookings.find(
      (trip) => trip.status === "searching" || trip.status === "accepted",
    );
    setActiveBooking(active || null);
  }, [bookings]);

  // --- HANDLERS ---
  const handleHiringTypeChange = (event, newValue) => {
    setHiringType(newValue);
    setVehicleType("SEDAN");
    if (newValue !== 0) {
      setShiftType("fixed");
    }
    // Reset dates on tab switch
    setSelectedDates([]);
    setDateRange({ start: null, end: null });
  };

  const handleShiftTypeChange = (event, newAlignment) => {
    if (newAlignment !== null) setShiftType(newAlignment);
  };

  const handleFixedHoursChange = (event, newAlignment) => {
    if (newAlignment !== null) setFixedHours(newAlignment);
  };

  // --- CUSTOM CALENDAR LOGIC ---
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    const newDate = new Date(
      currentMonth.setMonth(currentMonth.getMonth() - 1),
    );
    const today = new Date();
    if (
      newDate.getMonth() < today.getMonth() &&
      newDate.getFullYear() <= today.getFullYear()
    ) {
      setCurrentMonth(new Date());
    } else {
      setCurrentMonth(new Date(newDate));
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)),
    );
  };

  const isDateDisabled = (day) => {
    const dateToCheck = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Disable Past Dates
    if (dateToCheck < today) return true;

    // 2. Flexi Time Check for Today
    if (
      hiringType === 0 &&
      shiftType === "flexi" &&
      dateToCheck.getTime() === today.getTime()
    ) {
      const currentHour = new Date().getHours();
      const [startH] = startTime.split(":").map(Number);
      if (startH <= currentHour) return true;
    }

    return false;
  };

  const handleDateClick = (day) => {
    if (isDateDisabled(day)) return;

    const clickedDateObj = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    clickedDateObj.setHours(0, 0, 0, 0);
    const dateString = clickedDateObj.toDateString();

    // --- OUTSTATION LOGIC (Range Selection) ---
    if (hiringType === 2) {
      if (!dateRange.start || (dateRange.start && dateRange.end)) {
        // Start new selection
        setDateRange({ start: clickedDateObj, end: null });
      } else {
        // Selecting End Date
        if (clickedDateObj < dateRange.start) {
          // If clicked date is before start, make it the new start
          setDateRange({ start: clickedDateObj, end: null });
        } else {
          // Set End Date
          setDateRange({ ...dateRange, end: clickedDateObj });
        }
      }
      return;
    }

    // --- MONTHLY / SHORT TERM LOGIC (Individual Selection) ---
    // Monthly Limit Logic
    if (hiringType === 1) {
      const totalDaysInMonth = getDaysInMonth(currentMonth);
      const maxSelectable =
        totalDaysInMonth === 31 ? 27 : totalDaysInMonth === 30 ? 26 : 25;

      if (!selectedDates.includes(dateString)) {
        if (selectedDates.length >= maxSelectable) {
          dispatch(
            showNotification({
              message: `Maximum ${maxSelectable} days allowed.`,
              severity: "warning",
            }),
          );
          return;
        }
      }
    }

    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateString));
    } else {
      const newDates = [...selectedDates, dateString].sort(
        (a, b) => new Date(a) - new Date(b),
      );
      setSelectedDates(newDates);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (
      <Box
        sx={{
          p: { xs: 1, md: 2 }, // Reduced padding on mobile
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          bgcolor: "background.paper",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Calendar Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <IconButton
            onClick={handlePrevMonth}
            size="small"
            sx={{ color: "black" }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="black"
            sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
          >
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Typography>
          <IconButton
            onClick={handleNextMonth}
            size="small"
            sx={{ color: "black" }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Days Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            mb: 1,
          }}
        >
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <Typography
              key={i}
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
            >
              {d}
            </Typography>
          ))}
        </Box>

        {/* Dates Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
          }}
        >
          {blanks.map((_, i) => (
            <Box key={`blank-${i}`} />
          ))}

          {days.map((day) => {
            const currentDayObj = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day,
            );
            currentDayObj.setHours(0, 0, 0, 0);
            const dateString = currentDayObj.toDateString();
            const disabled = isDateDisabled(day);

            // --- Visual Logic ---
            let isSelected = false;
            let isRangeStart = false;
            let isRangeEnd = false;
            let isInRange = false;

            if (hiringType === 2) {
              // Outstation Visuals
              if (
                dateRange.start &&
                currentDayObj.getTime() === dateRange.start.getTime()
              )
                isRangeStart = true;
              if (
                dateRange.end &&
                currentDayObj.getTime() === dateRange.end.getTime()
              )
                isRangeEnd = true;
              if (
                dateRange.start &&
                dateRange.end &&
                currentDayObj > dateRange.start &&
                currentDayObj < dateRange.end
              )
                isInRange = true;
            } else {
              // Standard Visuals
              isSelected = selectedDates.includes(dateString);
            }

            // Styles
            const getBgColor = () => {
              if (isRangeStart || isRangeEnd || isSelected) return "black";
              if (isInRange) return "#eeeeee";
              return "transparent";
            };

            const getTextColor = () => {
              if (isRangeStart || isRangeEnd || isSelected) return "white";
              if (disabled) return "#e0e0e0";
              return "black";
            };

            const getBorderRadius = () => {
              if (
                hiringType === 2 &&
                (isInRange || isRangeStart || isRangeEnd)
              ) {
                if (isRangeStart && dateRange.end) return "50% 0 0 50%";
                if (isRangeEnd) return "0 50% 50% 0";
                if (isInRange) return "0";
                return "50%";
              }
              return "50%";
            };

            return (
              <Box
                key={day}
                onClick={() => handleDateClick(day)}
                sx={{
                  aspectRatio: "1/1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: disabled ? "default" : "pointer",
                  bgcolor: getBgColor(),
                  color: getTextColor(),
                  borderRadius: getBorderRadius(),
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                  fontWeight:
                    isSelected || isRangeStart || isRangeEnd
                      ? "bold"
                      : "normal",
                  position: "relative",
                  "&:hover": {
                    bgcolor:
                      !disabled &&
                      !isSelected &&
                      !isRangeStart &&
                      !isRangeEnd &&
                      !isInRange
                        ? "#f5f5f5"
                        : undefined,
                    border:
                      !disabled &&
                      !isSelected &&
                      !isRangeStart &&
                      !isRangeEnd &&
                      !isInRange
                        ? "1px solid black"
                        : undefined,
                  },
                }}
              >
                {day}
              </Box>
            );
          })}
        </Box>

        {/* Footer Text */}
        <Box sx={{ mt: 2, textAlign: "center", minHeight: "20px" }}>
          <Typography variant="caption" color="text.secondary">
            {hiringType === 2
              ? dateRange.start && dateRange.end
                ? `${dateRange.start.toLocaleDateString()} — ${dateRange.end.toLocaleDateString()}`
                : "Select Start and End Date"
              : hiringType === 1
                ? `Selected: ${selectedDates.length} days`
                : `${selectedDates.length > 0 ? selectedDates.length : "Select"} dates`}
          </Typography>
        </Box>
      </Box>
    );
  };

  const handleBookRequest = async () => {
    setIsProcessing(true);

    const typeMap = { 0: "Short Term", 1: "Monthly", 2: "Outstation" };
    let payload = {
      hiring_type: typeMap[hiringType],
      vehicle_type: vehicleType,
      reason: reason,
    };

    if (hiringType === 2) {
      if (!tripData?.startPoint || !tripData?.destination) {
        dispatch(
          showNotification({
            message: "Please select start/destination in Planner.",
            severity: "warning",
          }),
        );
        setIsProcessing(false);
        return;
      }

      if (!dateRange.start || !dateRange.end) {
        dispatch(
          showNotification({
            message: "Please select a date range.",
            severity: "warning",
          }),
        );
        setIsProcessing(false);
        return;
      }

      payload.start_location = tripData.startPoint;
      payload.end_location = tripData.destination;
      const toLocalISO = (dt) => {
        const offset = dt.getTimezoneOffset() * 60000;
        return new Date(dt.getTime() - offset).toISOString().split("T")[0];
      };

      payload.start_date = toLocalISO(dateRange.start);
      payload.end_date = toLocalISO(dateRange.end);
      payload.shift_details = "Outstation Trip";
    } else {
      if (selectedDates.length === 0) {
        dispatch(
          showNotification({
            message: "Please select at least one date.",
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

      const sorted = [...selectedDates].sort(
        (a, b) => new Date(a) - new Date(b),
      );
      payload.start_date = new Date(sorted[0]).toISOString().split("T")[0];
      payload.end_date = new Date(sorted[sorted.length - 1])
        .toISOString()
        .split("T")[0];

      payload.start_location = "Local";
      payload.end_location = "Local";
      payload.shift_details =
        shiftType === "fixed"
          ? `${fixedHours} Hours/Day`
          : `${flexiHours} Hours (${startTime})`;
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
        setSelectedDates([]);
        setDateRange({ start: null, end: null });
        setReason("");
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
  const VehicleSelection = () => {
    const allVehicles = [
      "SEDAN",
      "SUV",
      "HATCHBACK",
      "LUXURY",
      "TEMPO",
      "MINIBUS",
      "BUS",
    ];
    const filteredVehicles =
      hiringType === 0 || hiringType === 1
        ? allVehicles.filter((v) => v !== "MINIBUS" && v !== "BUS")
        : allVehicles;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          color="black"
        >
          Select Vehicle Type
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: isMobile ? "nowrap" : "wrap",
            gap: 1.5,
            overflowX: isMobile ? "auto" : "visible",
            pb: 1,
            "::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {filteredVehicles.map((type) => (
            <Paper
              key={type}
              elevation={vehicleType === type ? 4 : 1}
              onClick={() => setVehicleType(type)}
              sx={{
                p: 1.5,
                cursor: "pointer",
                border:
                  vehicleType === type
                    ? `2px solid black`
                    : "2px solid transparent",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 90,
                flexShrink: 0,
                bgcolor: vehicleType === type ? "#f5f5f5" : "background.paper",
                opacity: vehicleType === type ? 1 : 0.7,
                transition: "0.2s",
              }}
            >
              <VehicleIcon type={type} height="35px" />
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{ mt: 1, color: "black" }}
              >
                {type}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* --- HEADER --- */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h3"
          fontWeight="800"
          gutterBottom
          sx={{ color: "black" }}
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
            {/* Status View */}
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
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                color="black"
              >
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
                <strong>{activeBooking.vehicle_type}</strong> driver.
              </Typography>
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
            <Button
              variant="contained"
              sx={{
                bgcolor: "black",
                color: "white",
                "&:hover": { bgcolor: "#333" },
              }}
              startIcon={
                isProcessing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CancelIcon />
                )
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
            sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}
          >
            <Tabs
              value={hiringType}
              onChange={handleHiringTypeChange}
              variant={isMobile ? "fullWidth" : "standard"}
              centered={!isMobile}
              textColor="inherit"
              indicatorColor="primary"
              sx={{
                "& .Mui-selected": {
                  color: "black !important",
                  fontWeight: "bold",
                },
              }}
            >
              <Tab icon={<CalendarMonthIcon />} label="Short Term" />
              <Tab icon={<AccessTimeIcon />} label="Monthly" />
              <Tab icon={<MapIcon />} label="Outstation" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Fade in={true} key={hiringType}>
              <Box>
                {/* Outstation Planner */}
                {hiringType === 2 && (
                  <Box sx={{ mb: 4 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <strong>Note:</strong> Outstation trips include a driver
                      allowance.
                    </Alert>
                    <TripPlanner />
                  </Box>
                )}

                {/* Using dynamic spacing to reduce gaps on mobile */}
                <Grid container spacing={{ xs: 2, md: 4 }}>
                  <Grid item xs={12} md={6}>
                    <VehicleSelection />

                    {/* Shift Duration - Only for Local */}
                    {(hiringType === 0 || hiringType === 1) && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                          color="black"
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
                          <ToggleButton
                            value="fixed"
                            sx={{
                              color: "black",
                              "&.Mui-selected": {
                                bgcolor: "black",
                                color: "white",
                                "&:hover": { bgcolor: "#333" },
                              },
                            }}
                          >
                            <WorkHistoryIcon sx={{ mr: 1 }} /> Full Shift
                          </ToggleButton>
                          {/* Flexi only for Short Term */}
                          {hiringType === 0 && (
                            <ToggleButton
                              value="flexi"
                              sx={{
                                color: "black",
                                "&.Mui-selected": {
                                  bgcolor: "black",
                                  color: "white",
                                  "&:hover": { bgcolor: "#333" },
                                },
                              }}
                            >
                              <AccessTimeIcon sx={{ mr: 1 }} /> Flexi / Hourly
                            </ToggleButton>
                          )}
                        </ToggleButtonGroup>

                        <Paper
                          variant="outlined"
                          sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}
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
                                fullWidth
                                size="small"
                              >
                                <ToggleButton
                                  value={8}
                                  sx={{
                                    "&.Mui-selected": {
                                      bgcolor: "black",
                                      color: "white",
                                    },
                                  }}
                                >
                                  8 Hrs
                                </ToggleButton>
                                <ToggleButton
                                  value={9}
                                  sx={{
                                    "&.Mui-selected": {
                                      bgcolor: "black",
                                      color: "white",
                                    },
                                  }}
                                >
                                  9 Hrs
                                </ToggleButton>
                                <ToggleButton
                                  value={10}
                                  sx={{
                                    "&.Mui-selected": {
                                      bgcolor: "black",
                                      color: "white",
                                    },
                                  }}
                                >
                                  10 Hrs
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </Box>
                          ) : (
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 2,
                                }}
                              >
                                <Typography variant="body2" fontWeight="bold">
                                  Duration:
                                </Typography>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={flexiHours}
                                  onChange={(e) => {
                                    const val = Math.min(
                                      4,
                                      Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    );
                                    setFlexiHours(val);
                                  }}
                                  inputProps={{ min: 1, max: 4 }}
                                  sx={{ width: 80 }}
                                  helperText="1-4 Hours"
                                />
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body2" fontWeight="bold">
                                  Start Time:
                                </Typography>
                                <TextField
                                  type="time"
                                  size="small"
                                  value={startTime}
                                  onChange={(e) => setStartTime(e.target.value)}
                                  sx={{ width: 120 }}
                                />
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {/* Date Selection */}
                    <Box sx={{ mb: 3, width: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                        color="black"
                      >
                        Select Dates
                      </Typography>

                      {renderCalendar()}
                    </Box>

                    <Box sx={{ mb: 3, width: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                        color="black"
                      >
                        Main Reason
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="E.g., Office commute, Family event..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        sx={{ bgcolor: "#f9f9f9" }}
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
                      sx={{
                        height: 50,
                        fontSize: "1.1rem",
                        bgcolor: "black",
                        color: "white",
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#333" },
                      }}
                    >
                      {isProcessing ? "Processing..." : "Confirm Booking"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          </CardContent>
        </Paper>
      )}

      {/* --- PAST BOOKINGS SECTION --- */}
      <Box sx={{ mt: 6 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            mb: 2,
          }}
          onClick={() => setHistoryExpanded(!historyExpanded)}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ display: "flex", alignItems: "center", color: "black" }}
          >
            <HistoryIcon sx={{ mr: 1 }} /> Booking History
          </Typography>
          <IconButton onClick={() => setHistoryExpanded(!historyExpanded)}>
            {historyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={historyExpanded}>
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
            <List>
              {bookings && bookings.length > 0 ? (
                bookings
                  .slice(
                    (historyPage - 1) * historyItemsPerPage,
                    historyPage * historyItemsPerPage,
                  )
                  .map((trip) => (
                    <React.Fragment key={trip.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor:
                                trip.status === "cancelled"
                                  ? "grey.300"
                                  : "black",
                              color: "white",
                            }}
                          >
                            <DirectionsCarIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight="bold">
                              {trip.hiring_type} • {trip.vehicle_type}
                            </Typography>
                          }
                          secondary={`${trip.start_date} | ${trip.shift_details || "N/A"}`}
                        />
                        <Chip
                          label={trip.status}
                          size="small"
                          sx={{
                            bgcolor:
                              trip.status === "completed"
                                ? "success.light"
                                : trip.status === "cancelled"
                                  ? "error.light"
                                  : "primary.light",
                            fontWeight: "bold",
                            color: "black",
                          }}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No booking history found."
                    secondary="Your past bookings will appear here."
                  />
                </ListItem>
              )}
            </List>
            {bookings.length > historyItemsPerPage && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <Pagination
                  count={Math.ceil(bookings.length / historyItemsPerPage)}
                  page={historyPage}
                  onChange={(e, v) => setHistoryPage(v)}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        </Collapse>
      </Box>
    </Container>
  );
}
