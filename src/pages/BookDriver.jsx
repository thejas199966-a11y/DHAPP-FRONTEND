import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Box,
  Avatar,
  Skeleton,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Badge,
  Paper,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import StarIcon from "@mui/icons-material/Star";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import FilterListIcon from "@mui/icons-material/FilterList";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchDrivers } from "../features/driverSlice"; // Ensure this matches your slice path
import { showNotification } from "../features/notificationSlice";
import { useTranslation } from "react-i18next";

export default function BookDriver() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // 1. Get Data from Redux
  const { list: drivers, status } = useSelector((state) => state.drivers);

  // 2. Local State for Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // 'All', 'Sedan', 'SUV', etc.
  const [sortBy, setSortBy] = useState("rating"); // 'rating', 'experience'
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // 3. Initial Fetch
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchDrivers());
    }
  }, [status, dispatch]);

  // --- LOGIC: FILTERING & SORTING ---
  const filteredDrivers = drivers
    .filter((driver) => {
      // Search Logic (Name or Phone)
      const matchesSearch =
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone_number.includes(searchTerm);

      // Category Filter Logic
      const matchesType =
        filterType === "ALL" || driver.vehicle_type === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Sorting Logic
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0); // High to Low
      if (sortBy === "experience")
        return (b.experience_years || 0) - (a.experience_years || 0);
      return 0;
    });

  // --- LOGIC: PAGINATION ---
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = filteredDrivers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleBookNow = (driverId) => {
    console.log(`Booking initiated for Driver ID: ${driverId}`);
    dispatch(
      showNotification({
        message: t("book_driver.booking_notification"),
        severity: "info",
      })
    );
  };


  // Skeleton Loader (Matches Card Layout)
  const renderSkeletons = () =>
    Array.from(new Array(itemsPerPage)).map((_, index) => (
      <Grid item key={index} xs={12} sm={6} md={4}>
        <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ textAlign: "center", p: 3 }}>
            <Skeleton
              variant="circular"
              width={80}
              height={80}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Skeleton
              variant="text"
              width="60%"
              height={32}
              sx={{ mx: "auto", mb: 1 }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Skeleton
                  variant="rectangular"
                  height={30}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <Skeleton
                  variant="rectangular"
                  height={30}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
            </Grid>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={40}
              sx={{ borderRadius: 1 }}
            />
          </CardContent>
        </Card>
      </Grid>
    ));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* --- HEADER SECTION --- */}
      <Box sx={{ mb: 5, textAlign: "center" }}>
        <Typography
          variant="h3"
          fontWeight="800"
          gutterBottom
          color="primary.main"
        >
          {t("book_driver.title")}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto" }}
        >
          {t("book_driver.subtitle")}
        </Typography>
      </Box>

      {/* --- CONTROLS SECTION (Search, Filter, Sort) --- */}
      <Paper
        elevation={2}
        sx={{ p: 2, mb: 4, borderRadius: 3, bgcolor: "#f8f9fa" }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t("book_driver.search_placeholder")}
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: "white" }}
            />
          </Grid>

          {/* Filter Dropdown */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small" sx={{ bgcolor: "white" }}>
              <InputLabel>{t("book_driver.vehicle_type_label")}</InputLabel>
              <Select
                value={filterType}
                label={t("book_driver.vehicle_type_label")}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="ALL">{t("book_driver.all_types")}</MenuItem>
                <MenuItem value="SEDAN">{t("book_driver.sedan")}</MenuItem>
                <MenuItem value="SUV">{t("book_driver.suv")}</MenuItem>
                <MenuItem value="HATCHBACK">{t("book_driver.hatchback")}</MenuItem>
                <MenuItem value="LUXURY">{t("book_driver.luxury")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Dropdown */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small" sx={{ bgcolor: "white" }}>
              <InputLabel>{t("book_driver.sort_by_label")}</InputLabel>
              <Select
                value={sortBy}
                label={t("book_driver.sort_by_label")}
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="rating">{t("book_driver.highest_rated")}</MenuItem>
                <MenuItem value="experience">{t("book_driver.most_experienced")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* --- DRIVER GRID --- */}
      <Grid container spacing={3}>
        {/* Loading State */}
        {status === "loading"
          ? renderSkeletons()
          : paginatedDrivers.map((driver) => (
              <Grid item key={driver.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "0.3s",
                    borderRadius: 3,
                    "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {/* Rating Badge (Top Right) */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "#fffbf0",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        border: "1px solid #ffcd38",
                      }}
                    >
                      <StarIcon
                        sx={{ color: "#ffb400", fontSize: 18, mr: 0.5 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {driver.rating || "0.0"}
                      </Typography>
                    </Box>

                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 90,
                        height: 90,
                        margin: "0 auto",
                        mb: 2,
                        bgcolor: "#e3f2fd",
                        color: "#1976d2",
                      }}
                      src={driver.avatar_url} // If you have images
                    >
                      {!driver.avatar_url && (
                        <PersonIcon style={{ fontSize: 50 }} />
                      )}
                    </Avatar>

                    <Typography variant="h6" fontWeight="bold">
                      {driver.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {driver.vehicle_type || "Professional Driver"}
                    </Typography>

                    {/* Badges Row */}
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      sx={{ my: 2 }}
                    >
                      <Chip
                        icon={<VerifiedUserIcon />}
                        label={t("book_driver.verified")}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        icon={<WorkHistoryIcon />}
                        label={`${driver.experience_years || 3}+ ${t(
                          "book_driver.years_abbr"
                        )}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>

                    {/* Status Indicator */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          mr: 1,
                          bgcolor:
                            driver.status === "busy"
                              ? "error.main"
                              : "success.main",
                        }}
                      />
                      <Typography
                        variant="caption"
                        color={
                          driver.status === "busy"
                            ? "error.main"
                            : "success.main"
                        }
                        fontWeight="bold"
                      >
                        {driver.status === "busy"
                          ? t("book_driver.status_on_trip")
                          : t("book_driver.status_available")}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Footer / Action Button */}
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      disableElevation
                      disabled={driver.status === "busy"}
                      onClick={() => handleBookNow(driver.id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "1rem",
                        py: 1,
                      }}
                    >
                      {driver.status === "busy"
                        ? t("book_driver.status_unavailable")
                        : t("book_driver.book_driver_button")}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}

        {/* Empty State */}
        {status === "succeeded" && filteredDrivers.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                {t("book_driver.no_drivers_found")}
              </Typography>
              <Button
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("ALL");
                }}
              >
                {t("book_driver.clear_filters_button")}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* --- PAGINATION --- */}
      {filteredDrivers.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}
