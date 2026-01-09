import React from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useTranslation } from "react-i18next";

const OrgDashboard = () => {
  const { t } = useTranslation();
  // Mock Fleet Data
  const fleet = [
    {
      id: "KA01AB1234",
      driver: "Ramesh Kumar",
      car: "Toyota Etios",
      status: "org_dashboard.status_on_trip",
    },
    {
      id: "KA05XY9876",
      driver: "Suresh V",
      car: "Maruti Dzire",
      status: "org_dashboard.status_available",
    },
    {
      id: "KA53MN4567",
      driver: t("org_dashboard.unassigned"),
      car: "Innova Crysta",
      status: "org_dashboard.status_maintenance",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
        <BusinessIcon sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Alpha Travels
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("org_dashboard.title")}
          </Typography>
        </Box>
      </Box>

      {/* --- OVERVIEW CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "5px solid #1976d2" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t("org_dashboard.total_vehicles")}
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                12
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "5px solid #2e7d32" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t("org_dashboard.active_trips")}
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                5
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "5px solid #ed6c02" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t("org_dashboard.drivers_online")}
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                8
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- FLEET TABLE --- */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
        {t("org_dashboard.live_fleet_status")}
      </Typography>
      <Box sx={{ overflowX: "auto" }}>
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>
                  <strong>{t("org_dashboard.vehicle_no")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("org_dashboard.driver")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("org_dashboard.car_model")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("org_dashboard.status")}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fleet.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {item.id}
                  </TableCell>
                  <TableCell>{item.driver}</TableCell>
                  <TableCell>{item.car}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(item.status)}
                      color={
                        item.status === "org_dashboard.status_available"
                          ? "success"
                          : item.status === "org_dashboard.status_on_trip"
                          ? "primary"
                          : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default OrgDashboard;
