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

export default function BookDriver() {
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
    dispatch(showNotification({ message: "Booking Feature coming in next module!", severity: "info" }));
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
          Meet Our Drivers
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto" }}
        >
          Professional, verified, and ready to drive you safely to your
          destination.
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
              placeholder="Search by name..."
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
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={filterType}
                label="Vehicle Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="SEDAN">Sedan</MenuItem>
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="HATCHBACK">Hatchback</MenuItem>
                <MenuItem value="LUXURY">Luxury</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Dropdown */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small" sx={{ bgcolor: "white" }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="experience">Most Experienced</MenuItem>
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
                        label="Verified"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        icon={<WorkHistoryIcon />}
                        label={`${driver.experience_years || 3}+ Yrs`}
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
                          ? "Currently On Trip"
                          : "Available Now"}
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
                      {driver.status === "busy" ? "Unavailable" : "Book Driver"}
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
                No drivers found matching your criteria.
              </Typography>
              <Button
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("ALL");
                }}
              >
                Clear Filters
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
