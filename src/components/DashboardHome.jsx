import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Paper,
  Button,
  Pagination,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

const mockCompletedTrips = [
  {
    id: 1,
    start_location: "Indiranagar",
    end_location: "Airport",
    booking_time: "2026-01-10T10:30:00Z",
    fare: 850,
  },
  {
    id: 2,
    start_location: "Koramangala",
    end_location: "Whitefield",
    booking_time: "2026-01-09T18:15:00Z",
    fare: 420,
  },
  {
    id: 3,
    start_location: "Jayanagar",
    end_location: "Majestic",
    booking_time: "2026-01-09T14:00:00Z",
    fare: 250,
  },
  {
    id: 4,
    start_location: "Malleshwaram",
    end_location: "Electronic City",
    booking_time: "2026-01-08T09:45:00Z",
    fare: 600,
  },
  {
    id: 5,
    start_location: "Hebbal",
    end_location: "MG Road",
    booking_time: "2026-01-07T20:00:00Z",
    fare: 350,
  },
  {
    id: 6,
    start_location: "Marathahalli",
    end_location: "Silk Board",
    booking_time: "2026-01-07T11:20:00Z",
    fare: 180,
  },
];

const DashboardHome = ({ trips = [...mockCompletedTrips] }) => {
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  // Use hardcoded data for calculations
  const totalEarnings = trips.reduce((acc, trip) => acc + (trip.fare || 0), 0);
  const totalTrips = trips.length;

  // Pagination logic
  const paginatedTrips = showAll
    ? trips.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : trips.slice(0, 2);
  const totalPages = Math.ceil(trips.length / itemsPerPage);

  return (
    <Grid container spacing={3}>
      {/* Total Earnings Card */}
      <Grid item xs={12} sm={6}>
        <Card
          component={Paper}
          elevation={4}
          sx={{ backgroundColor: "primary.main", color: "white" }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div">
                  ₹{totalEarnings.toFixed(2)}
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>Total Earnings</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Trips Card */}
      <Grid item xs={12} sm={6}>
        <Card
          component={Paper}
          elevation={4}
          sx={{ backgroundColor: "secondary.main", color: "white" }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ConfirmationNumberIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div">
                  {totalTrips}
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  Total Completed Trips
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Trips List */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Recent Trips
        </Typography>
        <Card component={Paper} elevation={2} sx={{ p: 2 }}>
          <List>
            {paginatedTrips.map((trip, index) => (
              <React.Fragment key={trip.id}>
                <ListItem>
                  <ListItemText
                    primary={`${trip.start_location} to ${trip.end_location}`}
                    secondary={`Completed on: ${new Date(
                      trip.booking_time
                    ).toLocaleDateString()}`}
                  />
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="success.main"
                  >
                    + ₹{trip.fare?.toFixed(2) || "0.00"}
                  </Typography>
                </ListItem>
                {index < paginatedTrips.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {trips.length === 0 && (
              <ListItem>
                <ListItemText primary="No completed trips yet." />
              </ListItem>
            )}
          </List>
          {!showAll && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button onClick={() => setShowAll(true)}>Show More</Button>
            </Box>
          )}
          {showAll && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardHome;
