import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((state) => state.logins);

  return (
    <AppBar position="static" sx={{ backgroundColor: "#448cebff" }}>
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 2, ml: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/">
            DhApp
          </Button>
        </Typography>

        {user ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2, ml: 2 }}>
              Hello, {user}
            </Typography>
          </Box>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/login">
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
