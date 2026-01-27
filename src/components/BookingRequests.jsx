import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  WorkHistory as ShiftIcon,
  Event as DateIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Description as ReasonIcon,
} from "@mui/icons-material";

const BookingRequests = ({ offers = [], onAccept, onReject }) => {
  const theme = useTheme();

  if (!offers || offers.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 5,
          opacity: 0.7,
        }}
      >
        <img
          src="/src/assets/images/dashboard_driver.png"
          alt="No Requests"
          style={{
            maxWidth: "200px",
            marginBottom: "20px",
            filter: "grayscale(100%)",
          }}
        />
        <Typography variant="h6" color="text.secondary">
          No new booking requests.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We will notify you when a new trip arrives.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {offers?.map((offer) => {
        // Safe Trip Details from Backend
        const trip = offer.trip;

        return (
          <Grid item key={offer.id} xs={12} md={6} lg={4}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 4,
                transition: "0.3s",
                border: "1px solid rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "visible",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: theme.shadows[10],
                },
              }}
            >
              {/* Hiring Type Badge */}
              <Chip
                label={trip.hiring_type}
                color="secondary"
                size="small"
                sx={{
                  position: "absolute",
                  top: -10,
                  right: 20,
                  fontWeight: "bold",
                  boxShadow: 2,
                }}
              />

              <CardContent sx={{ p: 0 }}>
                {/* --- HEADER --- */}
                <Box
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    p: 2,
                    pt: 3,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.8, letterSpacing: 1 }}
                  >
                    TRIP #{trip.id}
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 1 }}
                  >
                    <DateIcon fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {trip.start_date === trip.end_date
                        ? trip.start_date
                        : `${trip.start_date} to ${trip.end_date}`}
                    </Typography>
                  </Stack>
                </Box>

                {/* --- BODY --- */}
                <Box sx={{ p: 2.5 }}>
                  {/* Route */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <LocationIcon color="success" fontSize="small" />
                      <Box
                        sx={{
                          width: "2px",
                          flex: 1,
                          minHeight: "20px",
                          bgcolor: "grey.300",
                          my: 0.5,
                        }}
                      />
                      <LocationIcon color="error" fontSize="small" />
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Typography variant="body2" fontWeight="600">
                        {trip.start_location || "Local Start"}
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {trip.end_location || "Local End"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Details */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.secondary",
                          mb: 0.5,
                        }}
                      >
                        <CarIcon fontSize="small" />
                        <Typography variant="caption">Vehicle</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {trip.vehicle_type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.secondary",
                          mb: 0.5,
                        }}
                      >
                        <ShiftIcon fontSize="small" />
                        <Typography variant="caption">Shift</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="500">
                        {trip.shift_details || "Standard"}
                      </Typography>
                    </Grid>

                    {/* Reason Section */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          bgcolor: "grey.100",
                          p: 1.5,
                          borderRadius: 2,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <ReasonIcon fontSize="small" color="action" />
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight="bold"
                          >
                            Request Note:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontStyle: "italic", lineHeight: 1.4 }}
                          >
                            "{trip.reason || "Safe & smooth drive requested."}"
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* --- ACTIONS --- */}
                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => onReject(offer.id)}
                    >
                      Reject
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<AcceptIcon />}
                      onClick={() => onAccept(offer.id)}
                      sx={{ boxShadow: 3 }}
                    >
                      Accept
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default BookingRequests;
