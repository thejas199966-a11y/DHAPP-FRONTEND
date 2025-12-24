import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material"; // CssBaseline helps with cross-browser consistency

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import BookDriver from "./pages/BookDriver";
import BookTravel from "./pages/BookTravel";

function App() {
  return (
    <Router>
      {/* CssBaseline kicks in MUI's normalization */}
      <CssBaseline />

      {/* minHeight: '100vh' ensures the app is AT LEAST the height of the screen.
         display: 'flex' + column allows us to push the footer to the bottom.
      */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100vw", // Explicitly take full width
        }}
      >
        <Navbar />

        {/* flexGrow: 1 pushes the Footer down if content is short */}
        <Box component="main" sx={{ flexGrow: 1, width: "100%" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/book-driver" element={<BookDriver />} />
            <Route path="/book-travel" element={<BookTravel />} />
          </Routes>
        </Box>

        <Footer />
      </Box>
    </Router>
  );
}

export default App;
