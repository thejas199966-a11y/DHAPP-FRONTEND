import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDriverById,
  fetchDriverReviews,
  resetDriverDetails,
} from "../features/driverSlice";
import { showNotification } from "../features/notificationSlice";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const DriverDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const driverId = state?.driver?.id;

  const {
    details,
    detailsStatus,
    reviews,
    reviewsStatus,
    reviewsPage,
    hasMoreReviews,
  } = useSelector((state) => state.drivers);

  useEffect(() => {
    if (driverId) {
      dispatch(fetchDriverById(driverId));
      dispatch(fetchDriverReviews({ driverId: driverId, page: 1 }));
    } else {
      // If no ID is present in state (e.g., direct navigation), redirect.
      navigate("/book-driver");
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetDriverDetails());
    };
  }, [driverId, dispatch, navigate]);

  const handleLoadMore = () => {
    if (hasMoreReviews && driverId) {
      dispatch(
        fetchDriverReviews({ driverId: driverId, page: reviewsPage + 1 })
      );
    }
  };

  const handleBookNow = () => {
    dispatch(
      showNotification({
        message: "This feature is coming soon!",
        severity: "info",
      })
    );
  };

  // Render a loader while waiting for redirect or initial data
  if (!driverId || (detailsStatus === "loading" && !details)) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (detailsStatus === "failed" || !details) {
    return (
      <Container sx={{ mt: 10 }}>
        <Alert severity="error">
          Could not load driver details. Please return to the previous page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Driver Details Card */}
        <Grid item xs={12} md={5}>
          <Card raised sx={{ p: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 2, bgcolor: "primary.main" }}
                >
                  {details.name.charAt(0)}
                </Avatar>
                <div>
                  <Typography variant="h4">{details.name}</Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                    }}
                  >
                    <StarIcon sx={{ color: "gold", mr: 0.5 }} />
                    <Typography variant="h6">
                      {details.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </div>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong>{" "}
                <Chip
                  label={details.status}
                  color={details.status === "available" ? "success" : "warning"}
                />
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Experience:</strong>{" "}
                {details.years_of_experience || "N/A"} years
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Vehicle:</strong> {details.vehicle_type || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Total Trips:</strong> {details.total_trips}
              </Typography>
              {details.spoken_languages && (
                <Typography variant="body1" gutterBottom>
                  <strong>Languages:</strong> {details.spoken_languages}
                </Typography>
              )}
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleBookNow}
                >
                  Book Driver
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12} md={7}>
          <Typography variant="h5" gutterBottom>
            Reviews
          </Typography>
          {reviews.length === 0 && reviewsStatus !== "loading" && (
            <Alert severity="info">No reviews yet for this driver.</Alert>
          )}
          {reviews.map((review) => (
            <Card key={review.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", mr: 1 }}
                  >
                    User {review.user_id}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                    }}
                  >
                    <StarIcon sx={{ color: "gold", fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">
                      {review.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {review.comment}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  {new Date(review.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {reviewsStatus === "loading" && (
            <CircularProgress
              sx={{ display: "block", margin: "auto", mt: 2 }}
            />
          )}
          {hasMoreReviews && reviews.length > 0 && (
            <Button
              onClick={handleLoadMore}
              disabled={reviewsStatus === "loading"}
              sx={{ mt: 2 }}
            >
              Load More Reviews
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DriverDetailPage;
