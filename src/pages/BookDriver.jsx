import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
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
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import StarIcon from "@mui/icons-material/Star";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIosNew from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import GridView from "@mui/icons-material/GridView";
import ViewCarouselOutlined from "@mui/icons-material/ViewCarouselOutlined";

// Custom Vehicle Icons
import VehicleIcon from "../components/VehicleIcons"; // Ensure the path is correct based on where you created the file

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchDrivers } from "../features/driverSlice";
import { showNotification } from "../features/notificationSlice";
import { useTranslation } from "react-i18next";

export default function BookDriver() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const carouselRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const { list: drivers, status } = useSelector((state) => state.drivers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [sortBy, setSortBy] = useState("rating");
  const [gridPage, setGridPage] = useState(1);
  const [viewMode, setViewMode] = useState("carousel");

  // --- RESPONSIVE & DERIVED VALUES ---
  const gridItemsPerPage = isMobile ? 12 : 15;

  let carouselVisibleItems;
  if (isMobile) {
    carouselVisibleItems = isLandscape ? 3 : 2;
  } else {
    carouselVisibleItems = 5;
  }

  // --- INITIAL FETCH ---
  useEffect(() => {
    dispatch(fetchDrivers());
  }, []);

  // --- LOGIC: FILTERING & SORTING ---
  const filteredDrivers = drivers
    .filter((driver) => {
      const matchesSearch =
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone_number.includes(searchTerm);
      const matchesType =
        filterType === "ALL" || driver.vehicle_type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "experience")
        return (b.years_of_experience || 0) - (a.years_of_experience || 0);
      return 0;
    });

  // --- CAROUSEL SCROLL HANDLERS ---
  const handleCarouselScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth;
      carouselRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // --- SKELETON LOADER ---
  const renderSkeletons = () =>
    Array.from(new Array(gridItemsPerPage)).map((_, index) => (
      <Grid item key={index} xs={3} sm={4} md={12 / 5}>
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
                <MenuItem value="HATCHBACK">
                  {t("book_driver.hatchback")}
                </MenuItem>
                <MenuItem value="LUXURY">{t("book_driver.luxury")}</MenuItem>
                <MenuItem value="TEMPO">{t("book_driver.tempo")}</MenuItem>
                <MenuItem value="MINIBUS">{t("book_driver.minibus")}</MenuItem>
                <MenuItem value="BUS">{t("book_driver.bus")}</MenuItem>
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
                <MenuItem value="rating">
                  {t("book_driver.highest_rated")}
                </MenuItem>
                <MenuItem value="experience">
                  {t("book_driver.most_experienced")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* --- VIEW TOGGLE --- */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        {filteredDrivers.length > 0 && (
          <>
            {viewMode === "carousel" ? (
              <Button
                startIcon={<GridView />}
                onClick={() => setViewMode("grid")}
                variant="outlined"
              >
                {t("book_driver.view_all")}
              </Button>
            ) : (
              <Button
                startIcon={<ViewCarouselOutlined />}
                onClick={() => setViewMode("carousel")}
                variant="outlined"
              >
                {t("book_driver.view_carousel")}
              </Button>
            )}
          </>
        )}
      </Box>

      {/* --- DRIVER LISTING (CAROUSEL / GRID) --- */}
      <Box>
        {(() => {
          // --- RENDER LOGIC ---
          const gridTotalPages = Math.ceil(
            filteredDrivers.length / gridItemsPerPage
          );
          const gridPaginatedDrivers = filteredDrivers.slice(
            (gridPage - 1) * gridItemsPerPage,
            gridPage * gridItemsPerPage
          );

          // Reusable Driver Card Component
          const DriverCard = ({ driver }) => (
            <Card
              component={Link}
              to="/driver-detail"
              state={{ driver: driver }}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "0.3s",
                borderRadius: 3,
                textDecoration: "none",
                color: "inherit",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  textAlign: "center",
                  position: "relative",
                  p: { xs: 2, md: 3 },
                }}
              >
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
                  <StarIcon sx={{ color: "#ffb400", fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {driver.rating || "0.0"}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: { xs: 70, md: 90 },
                    height: { xs: 70, md: 90 },
                    margin: "0 auto",
                    mb: 2,
                    bgcolor: "#e3f2fd",
                    color: "#1976d2",
                  }}
                  src={driver.avatar_url}
                >
                  {!driver.avatar_url && (
                    <PersonIcon sx={{ fontSize: { xs: 40, md: 50 } }} />
                  )}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {driver?.name}
                </Typography>

                {/* --- VEHICLE ICON REPLACEMENT START --- */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: isMobile ? "20px" : "32px",
                    mt: 1,
                    mb: 2,
                  }}
                >
                  {/* This replaces the text-based vehicle type display */}
                  <VehicleIcon
                    type={driver.vehicle_type}
                    height={isMobile ? "20px" : "32px"}
                  />
                </Box>
                {/* --- VEHICLE ICON REPLACEMENT END --- */}

                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  sx={{ my: 1 }}
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
                    label={`${driver.years_of_experience || 3}+ ${t(
                      "book_driver.years_abbr"
                    )}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
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
                      driver.status === "busy" ? "error.main" : "success.main"
                    }
                    fontWeight="bold"
                  >
                    {driver.status === "busy"
                      ? t("book_driver.status_on_trip")
                      : t("book_driver.status_available")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );

          if (status === "loading") {
            return (
              <Grid container spacing={3}>
                {renderSkeletons()}
              </Grid>
            );
          }

          if (status === "succeeded" && filteredDrivers.length === 0) {
            return (
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
            );
          }

          if (viewMode === "carousel") {
            const cardGap = theme.spacing(2); // 16px
            const cardWidth = `calc(100% / ${carouselVisibleItems} - (${cardGap} * (${carouselVisibleItems} - 1)) / ${carouselVisibleItems})`;

            return (
              <Box sx={{ position: "relative" }}>
                <IconButton
                  onClick={() => handleCarouselScroll("prev")}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: -25,
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    bgcolor: "background.paper",
                    boxShadow: 3,
                    "&:hover": { bgcolor: "grey.200" },
                  }}
                >
                  <ArrowBackIosNew />
                </IconButton>
                <Box
                  ref={carouselRef}
                  sx={{
                    display: "flex",
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    gap: cardGap,
                    py: 1, // Add padding for shadow visibility
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none", // For Firefox
                  }}
                >
                  {filteredDrivers.map((driver) => (
                    <Box
                      key={driver.id}
                      sx={{
                        minWidth: cardWidth,
                        flex: `0 0 ${cardWidth}`,
                        scrollSnapAlign: "start",
                      }}
                    >
                      <DriverCard driver={driver} />
                    </Box>
                  ))}
                </Box>
                <IconButton
                  onClick={() => handleCarouselScroll("next")}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: -25,
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    bgcolor: "background.paper",
                    boxShadow: 3,
                    "&:hover": { bgcolor: "grey.200" },
                  }}
                >
                  <ArrowForwardIos />
                </IconButton>
              </Box>
            );
          }

          if (viewMode === "grid") {
            return (
              <Box>
                <Grid container spacing={3}>
                  {gridPaginatedDrivers.map((driver) => (
                    <Grid item key={driver.id} xs={3} sm={4} md={12 / 5}>
                      <DriverCard driver={driver} />
                    </Grid>
                  ))}
                </Grid>
                {gridTotalPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 6 }}
                  >
                    <Pagination
                      count={gridTotalPages}
                      page={gridPage}
                      onChange={(e, value) => setGridPage(value)}
                      color="primary"
                      size="large"
                    />
                  </Box>
                )}
              </Box>
            );
          }
        })()}
      </Box>
    </Container>
  );
}
