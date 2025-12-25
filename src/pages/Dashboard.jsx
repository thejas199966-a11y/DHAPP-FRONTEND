import React from "react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // These hooks return true if the screen matches the size
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Phones
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // Tablets

  const items = [
    {
      img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1000&q=80",
      title: "Luxury Travel",
    },
    {
      img: "https://images.unsplash.com/photo-1533473359331-0135ef1bcfb0?auto=format&fit=crop&w=1000&q=80",
      title: "Safe Drivers",
    },
  ];

  return (
    // maxWidth="xl" allows it to be wider on large screens, but constrained on huge monitors
    // disableGutters={isMobile} removes side padding on very small phones so it fits better
    <Container
      maxWidth="xl"
      disableGutters={isMobile}
      sx={{ mt: isMobile ? 0 : 4, mb: 4, px: isMobile ? 0 : 2 }}
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
                alt={item.title}
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
                  variant={isMobile ? "h5" : "h3"} // Smaller font on mobile
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  {item.title}
                </Typography>
              </Box>
            </Box>
          ))}
        </Carousel>
      </Card>

      {/* 2. Action Buttons Section */}
      <Container maxWidth="lg">
        <Typography
          variant={isMobile ? "h5" : "h4"}
          align="center"
          gutterBottom
          sx={{ mb: 4, fontWeight: "medium", px: 2 }}
        >
          What are you looking for today?
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
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/book-travel")}
              sx={{
                height: isMobile ? 50 : 80, // Taller buttons on desktop
                fontSize: isMobile ? "1.2rem" : "1.5rem",
                borderRadius: 3,
                textTransform: "none",
                backgroundColor: "#2f34cfff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: 6,
              }}
            >
              Book Travel
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  opacity: 0.8,
                  fontSize: "0.8rem",
                }}
              >
                Long trips & Agencies
              </Typography>
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/book-driver")}
              sx={{
                height: isMobile ? 50 : 80,
                fontSize: isMobile ? "1.2rem" : "1.5rem",
                borderRadius: 3,
                textTransform: "none",
                backgroundColor: "#2f34cfff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: 6,
              }}
            >
              Book a Driver
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  opacity: 0.8,
                  fontSize: "0.8rem",
                }}
              >
                Hire for your own car
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

export default Dashboard;
