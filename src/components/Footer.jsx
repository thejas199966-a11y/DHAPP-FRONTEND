import React from "react";
import { Box, Typography, Container, Grid, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{ py: 3, px: 2, mt: "auto", backgroundColor: "#e3d8d8ff" }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              123 Main Street, Bangalore, India
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@dhapp.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
              <TwitterIcon />
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
