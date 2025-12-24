import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      {" "}
      {/* Primary Blue */}
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DriveHire
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/book-driver">
          Drivers
        </Button>
        <Button color="inherit" component={Link} to="/book-travel">
          Travel
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
