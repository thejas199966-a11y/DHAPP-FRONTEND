import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useDispatch } from "react-redux";
import { fetchInitialLocation } from "../features/locationSlice";

const MainLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInitialLocation());
  }, [dispatch]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        // width: '100vw', // this can cause issues with scrollbars
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, width: "100%" }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
