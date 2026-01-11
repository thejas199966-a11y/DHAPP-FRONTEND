import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  Alert,
} from "@mui/material";
import NavigationIcon from "@mui/icons-material/Navigation";

const BookingRequests = ({ bookings, onUpdateStatus }) => {
  if (bookings.length === 0) {
    return <Alert severity="info">No new booking requests.</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {bookings.map((booking) => (
        <Grid item key={booking.id} xs={12}>
          <Card raised>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Typography variant="h6">
                    {booking.start_location} to {booking.end_location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Booked on: {new Date(booking.booking_time).toLocaleString()}
                  </Typography>
                </div>
                <Chip
                  label={booking.status}
                  color={booking.status === "pending" ? "warning" : "info"}
                />
              </Box>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                }}
              >
                {booking.status === "pending" && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => onUpdateStatus(booking.id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => onUpdateStatus(booking.id, "declined")}
                    >
                      Decline
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default BookingRequests;
