import React from "react";
import { Box, Typography, Container, Grid, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: "rgb(0, 0, 0)",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="white" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="white">
              Bangalore, India
            </Typography>
            <Typography variant="body2" color="white">
              Email: support@dhire.com
            </Typography>
            <Typography variant="body2" color="white">
              Phone: +91 82967 89262
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: "right" }}>
            <Typography variant="h6" gutterBottom>
              Follow Us
            </Typography>
            <Link href="#" color="inherit" sx={{ mr: 1 }}>
              <FacebookIcon />
            </Link>
            <Link href="#" color="inherit" sx={{ mr: 1 }}>
              <XIcon />
            </Link>
            <Link href="#" color="inherit">
              <InstagramIcon />
            </Link>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
