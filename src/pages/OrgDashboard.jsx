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

const OrgDashboard = () => {
  // Mock Fleet Data
  const fleet = [
    {
      id: "KA01AB1234",
      driver: "Ramesh Kumar",
      car: "Toyota Etios",
      status: "On Trip",
    },
    {
      id: "KA05XY9876",
      driver: "Suresh V",
      car: "Maruti Dzire",
      status: "Available",
    },
    {
      id: "KA53MN4567",
      driver: "Unassigned",
      car: "Innova Crysta",
      status: "Maintenance",
    }
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
            Organisation Dashboard
          </Typography>
        </Box>
      </Box>

      {/* --- OVERVIEW CARDS --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: "5px solid #1976d2" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Vehicles
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
                Active Trips
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
                Drivers Online
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
        Live Fleet Status
      </Typography>
      <Box sx={{ overflowX: "auto" }}>
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>
                  <strong>Vehicle No</strong>
                </TableCell>
                <TableCell>
                  <strong>Driver</strong>
                </TableCell>
                <TableCell>
                  <strong>Car Model</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
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
                      label={item.status}
                      color={
                        item.status === "Available"
                          ? "success"
                          : item.status === "On Trip"
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
