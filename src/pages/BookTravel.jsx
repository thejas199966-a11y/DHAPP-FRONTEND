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
  Paper,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchTrips } from "../features/travelSlice";
import { showNotification } from "../features/notificationSlice";

export default function BookTravel() {
  const dispatch = useDispatch();

  // 1. Get Data from Redux
  const { list: trips, status } = useSelector((state) => state.travels);

  // 2. Local State for Filtering & Pagination
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sortBy, setSortBy] = useState("price_asc"); // 'price_asc', 'price_desc', 'rating'
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // 3. Initial Fetch
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTrips());
    }
  }, [status, dispatch]);

  // --- LOGIC: FILTERING & SORTING ---
  const filteredTrips = trips
    .filter((trip) => {
      const matchesSource = source === "" || trip.source.toLowerCase().includes(source.toLowerCase());
      const matchesDestination = destination === "" || trip.destination.toLowerCase().includes(destination.toLowerCase());
      return matchesSource && matchesDestination;
    })
    .sort((a, b) => {
      // Sorting Logic
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return (b.driver_rating || 0) - (a.driver_rating || 0);
      return 0;
    });

  // --- LOGIC: PAGINATION ---
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const paginatedTrips = filteredTrips.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleBookTrip = (tripId) => {
    console.log(`Booking initiated for Trip ID: ${tripId}`);
    dispatch(showNotification({ message: "Trip booking feature coming soon!", severity: "info" }));
  };

  // Skeleton Loader (Matches Card Layout)
  const renderSkeletons = () =>
    Array.from(new Array(itemsPerPage)).map((_, index) => (
      <Grid item key={index} xs={12} sm={6} md={4}>
        <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton variant="text" width="40%" height={30} />
                <Skeleton variant="text" width="40%" height={30} />
            </Box>
            <Skeleton variant="text" width="60%" height={24} sx={{ mx: "auto", mb: 2 }}/>
            <Skeleton variant="rectangular" height={40} sx={{ my: 2, borderRadius: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="rectangular" width="30%" height={36} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* --- HEADER SECTION --- */}
      <Box sx={{ mb: 5, textAlign: "center" }}>
        <Typography variant="h3" fontWeight="800" gutterBottom color="primary.main">
          Find Your Next Trip
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
          Explore shared taxi trips and book your seat with professional drivers.
        </Typography>
      </Box>

      {/* --- CONTROLS SECTION (Search, Filter, Sort) --- */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: 3, bgcolor: "#f8f9fa" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField fullWidth variant="outlined" placeholder="From (e.g., Bangalore)" size="small" value={source} onChange={(e) => setSource(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), }} sx={{ bgcolor: "white" }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth variant="outlined" placeholder="To (e.g., Mysore)" size="small" value={destination} onChange={(e) => setDestination(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), }} sx={{ bgcolor: "white" }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" sx={{ bgcolor: "white" }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)} startAdornment={<InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment>}>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                <MenuItem value="rating">Driver Rating</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* --- TRIP GRID --- */}
      <Grid container spacing={3}>
        {status === "loading"
          ? renderSkeletons()
          : paginatedTrips.map((trip) => (
              <Grid item key={trip.id} xs={12} sm={6} md={4}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: "0.3s", borderRadius: 3, "&:hover": { transform: "translateY(-5px)", boxShadow: 6 }, }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">{trip.source}</Typography>
                      <ArrowForwardIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">{trip.destination}</Typography>
                    </Box>
                    <Chip icon={<EventIcon />} label={new Date(trip.date).toDateString()} size="small" sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2, p: 1, borderRadius: 2, background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', color: 'white' }}>
                       <AttachMoneyIcon />
                       <Typography variant="h5" fontWeight="bold" component="span" sx={{ ml: 1 }}>
                         {trip.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })}
                       </Typography>
                    </Box>
                    <Chip icon={<DirectionsCarIcon />} label={trip.vehicle_type} size="small" variant="outlined" color="info" />
                     <Chip label={`${trip.available_seats} seats left`} size="small" variant="outlined" color={trip.status === 'full' ? 'error': 'success'} sx={{ ml: 1 }} />
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, borderTop: '1px solid #eee', mt: 'auto' }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: "#e3f2fd", color: "#1976d2", mr: 1.5 }}>
                                <PersonIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="bold">{trip.driver_name}</Typography>
                                <Box display="flex" alignItems="center">
                                    <StarIcon sx={{ color: "#ffb400", fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="body2">{trip.driver_rating}</Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Button variant="contained" disableElevation disabled={trip.status === 'full'} onClick={() => handleBookTrip(trip.id)} sx={{ borderRadius: 2, textTransform: 'none' }}>
                             {trip.status === 'full' ? 'Full' : 'Book Seat'}
                        </Button>
                     </Box>
                  </Box>
                </Card>
              </Grid>
            ))}

        {/* Empty State */}
        {status === "succeeded" && filteredTrips.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No trips found for the selected locations.
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => { setSource(""); setDestination(""); }}>
                Clear Search
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* --- PAGINATION --- */}
      {filteredTrips.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" size="large" />
        </Box>
      )}
    </Container>
  );
}
