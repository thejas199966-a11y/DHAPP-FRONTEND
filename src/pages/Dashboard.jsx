import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// --- Components ---
import TripPlanner from "../components/TripPlanner";
import AnimatedTravelButton from "../components/AnimatedTravelButton";
import AnimatedDriverButton from "../components/AnimatedDriverButton";

// --- Import Local Images ---
import travelBanner from "../assets/images/dashboard_travel.png";
import driverBanner from "../assets/images/dashboard_driver.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  // These hooks return true if the screen matches the size
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Phones
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // Tablets

  // Use the imported local images here
  const items = [
    {
      img: travelBanner,
      title: "dashboard.luxury_travel",
    },
    {
      img: driverBanner,
      title: "dashboard.safe_drivers",
    },
  ];

  return (
    // maxWidth="xl" allows it to be wider on large screens, but constrained on huge monitors
    // disableGutters={isMobile} removes side padding on very small phones so it fits better
    <Container
      maxWidth="xl"
      disableGutters={isMobile}
      sx={{ mt: isMobile ? 0 : 4, mb: 8, px: isMobile ? 0 : 2 }}
    >
      {/* 1. Hero / Carousel Section */}
      <Card
        sx={{
          borderRadius: isMobile ? 0 : 4, // Square corners on mobile, rounded on desktop
          boxShadow: 3,
          mb: 4,
          overflow: "hidden",
        }}
      >
        <Carousel animation="slide" interval={4000} indicators={false}>
          {items.map((item, i) => (
            <Box key={i} position="relative">
              <CardMedia
                component="img"
                // Height changes based on device: Mobile(250), Tablet(350), Desktop(450)
                height={isMobile ? "250" : isTablet ? "350" : "450"}
                image={item.img}
                alt={t(item.title)}
                sx={{ objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  bgcolor: "rgba(0, 0, 0, 0.4)", // Dark gradient overlay for text readability
                  p: 2,
                }}
              >
                <Typography
                  variant={isMobile ? "h6" : "h4"} // Smaller font on mobile
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  {t(item.title)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Carousel>
      </Card>

      {/* Trip Planner Component */}
      {/* <TripPlanner /> */}

      {/* 2. Action Buttons Section */}
      <Container maxWidth="lg">
        <Typography
          variant={isMobile ? "h5" : "h4"}
          align="center"
          gutterBottom
          sx={{ mb: 4, fontWeight: "medium", px: 2 }}
        >
          {t("dashboard.welcome")}
        </Typography>

        <Grid
          container
          spacing={isMobile ? 2 : 4}
          justifyContent="center"
          sx={{ px: isMobile ? 2 : 0 }}
        >
          {/* xs={12} = Full width on Mobile
              md={6} = Half width on Desktop/Tablet landscape
          */}
          <Grid item xs={12} md={6}>
            <AnimatedTravelButton
              t={t}
              navigate={navigate}
              isMobile={isMobile}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <AnimatedDriverButton
              t={t}
              navigate={navigate}
              isMobile={isMobile}
            />
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Dashboard;
