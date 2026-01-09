import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import NavigationIcon from "@mui/icons-material/Navigation";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HistoryIcon from "@mui/icons-material/History";
import { useTranslation } from "react-i18next";

const DriverDashboard = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(false);

  // Mock Data for "Real-time" feel
  const recentRides = [
    {
      id: 1,
      from: "Indiranagar",
      to: "Airport",
      fare: "₹850",
      status: "Completed",
      date: "Today, 10:30 AM",
    },
    {
      id: 2,
      from: "Koramangala",
      to: "Whitefield",
      fare: "₹420",
      status: "Completed",
      date: "Yesterday, 6:15 PM",
    },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* --- STATUS HEADER --- */}
      <Card
        sx={{
          mb: 4,
          bgcolor: isOnline ? "#e8f5e9" : "#ffebee",
          transition: "0.3s",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {isOnline
                ? t("driver_dashboard.online_status")
                : t("driver_dashboard.offline_status")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isOnline
                ? t("driver_dashboard.receiving_requests")
                : t("driver_dashboard.go_online_prompt")}
            </Typography>
          </Box>
          <Switch
            checked={isOnline}
            onChange={(e) => setIsOnline(e.target.checked)}
            color="success"
            inputProps={{ "aria-label": "controlled" }}
            sx={{ transform: "scale(1.5)" }}
          />
        </CardContent>
      </Card>

      {/* --- STATS GRID --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Card sx={{ textAlign: "center", bgcolor: "#e3f2fd" }}>
            <CardContent>
              <AttachMoneyIcon color="primary" fontSize="large" />
              <Typography variant="h4" fontWeight="bold">
                ₹1,270
              </Typography>
              <Typography variant="caption">
                {t("driver_dashboard.todays_earnings")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ textAlign: "center", bgcolor: "#f3e5f5" }}>
            <CardContent>
              <DirectionsCarIcon color="secondary" fontSize="large" />
              <Typography variant="h4" fontWeight="bold">
                4
              </Typography>
              <Typography variant="caption">
                {t("driver_dashboard.rides_completed")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- RECENT ACTIVITY --- */}
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <HistoryIcon sx={{ mr: 1 }} />{" "}
        {t("driver_dashboard.recent_activity")}
      </Typography>

      <Card>
        <List>
          {recentRides.map((ride) => (
            <ListItem key={ride.id} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "#2f34cfff" }}>
                  <NavigationIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${ride.from} ➔ ${ride.to}`}
                secondary={ride.date}
              />
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="success.main"
                >
                  {ride.fare}
                </Typography>
                <Chip
                  label={t("driver_dashboard.ride_status_completed")}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Floating Action Button logic for Mobile */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button variant="outlined" startIcon={<HistoryIcon />}>
          {t("driver_dashboard.view_full_history_button")}
        </Button>
      </Box>
    </Container>
  );
};

export default DriverDashboard;
