import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Typography, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { keyframes } from "@emotion/react";

// --- 1. Define Animations ---

// Sky Animations based on destination theme
const skyToDay = keyframes`
  0% { background-color: #2f34cfff; }
  100% { background-color: #87CEEB; } /* Bright Daylight Blue */
`;

const skyToNight = keyframes`
  0% { background-color: #2f34cfff; }
  100% { background-color: #0d1117; } /* Deep Midnight Blue */
`;

// Elements fading in (Road, City)
const elementFadeIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Car driving Left to Right
const carDriveRealistic = keyframes`
  0% { transform: translateX(-250px); }
  100% { transform: translateX(600px); }
`;

// --- 2. Define Realistic, Dynamic SVG Assets ---

// Realistic Sedan with Driver, Passenger, and dynamic Headlights
const SedanWithPeopleIcon = ({ isNight }) => (
  // Note: transform: scaleX(-1) flips it to face right
  <svg
    width="120"
    height="50"
    viewBox="0 0 350 120"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "scaleX(-1)" }}
  >
    {/* --- Dynamic Headlights (Only visible at night) --- */}
    {isNight && (
      <path
        d="M340,65 L450,30 L450,100 L340,85 Z"
        fill="url(#headlightGradient)"
        opacity="0.6"
      />
    )}
    {/* Car Body (Sleek Sedan) */}
    <path
      d="M10,70 Q15,55 40,52 L90,48 L130,20 L240,20 L270,48 L310,52 Q330,55 335,70 Q340,85 330,90 H20 Q10,85 10,70 Z"
      fill="white"
    />
    {/* Windows/Interior Base */}
    <path d="M135,25 L235,25 L265,50 L95,50 L135,25 Z" fill="#333" />
    {/* Driver Silhouette (Front Seat) */}
    <circle cx="210" cy="35" r="8" fill="#888" /> {/* Head */}
    <path d="M195,50 Q210,40 225,50 L225,55 L195,55 Z" fill="#888" />{" "}
    {/* Shoulders */}
    <circle cx="235" cy="45" r="3" fill="#bbb" /> {/* Hands on wheel */}
    {/* Passenger Silhouette (Back Seat) with Phone */}
    <circle cx="150" cy="38" r="7" fill="#888" /> {/* Head leaning */}
    <path d="M135,52 Q150,45 165,52 L165,55 L135,55 Z" fill="#888" />{" "}
    {/* Shoulders */}
    {/* The Glowing Phone Screen */}
    <rect
      x="145"
      y="45"
      width="10"
      height="6"
      fill={isNight ? "#4fc3f7" : "#cfd8dc"}
      transform="rotate(20 150 48)"
    />
    {/* Wheels */}
    <circle cx="70" cy="90" r="20" fill="#111" />
    <circle cx="70" cy="90" r="12" fill="none" stroke="#ddd" strokeWidth="3" />
    <circle cx="270" cy="90" r="20" fill="#111" />
    <circle cx="270" cy="90" r="12" fill="none" stroke="#ddd" strokeWidth="3" />
    {/* Definitions for Gradients */}
    <defs>
      <linearGradient id="headlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.9" />{" "}
        {/* Bright yellow-white source */}
        <stop offset="100%" stopColor="#fff9c4" stopOpacity="0.0" />{" "}
        {/* Fade to transparent */}
      </linearGradient>
    </defs>
  </svg>
);

// Realistic City Skyline with Dynamic Windows
const RealisticCityIcon = ({ isNight }) => {
  const windowColor = isNight ? "#ffd54f" : "#546e7a"; // Warm yellow for night, dark grey for day
  const buildingColor = isNight ? "#263238" : "#90a4ae"; // Darker buildings at night

  return (
    <svg
      width="100%"
      height="80"
      viewBox="0 0 600 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Building Shapes */}
      <polygon
        points="10,100 10,30 50,30 50,50 80,50 80,20 120,20 120,100"
        fill={buildingColor}
      />
      <polygon
        points="130,100 130,10 180,10 180,40 220,40 220,100"
        fill={buildingColor}
      />
      <polygon
        points="230,100 230,25 280,25 280,15 330,15 330,100"
        fill={buildingColor}
      />
      <polygon
        points="340,100 340,45 380,45 380,30 420,30 420,100"
        fill={buildingColor}
      />
      <polygon
        points="430,100 430,5 470,5 470,20 520,20 520,100"
        fill={buildingColor}
      />
      <polygon points="530,100 530,35 590,35 590,100" fill={buildingColor} />

      {/* Windows - A pattern of small rectangles. Only lit if isNight is true */}
      <g fill={windowColor} opacity={isNight ? 0.8 : 0.3}>
        {/* Skyscraper 1 windows */}
        <rect x="20" y="40" width="5" height="5" />
        <rect x="30" y="40" width="5" height="5" />
        <rect x="20" y="60" width="5" height="5" />
        <rect x="30" y="60" width="5" height="5" />
        <rect x="90" y="30" width="5" height="5" />
        <rect x="100" y="30" width="5" height="5" />
        <rect x="90" y="70" width="5" height="5" />
        <rect x="100" y="70" width="5" height="5" />

        {/* Skyscraper 2 windows */}
        <rect x="140" y="20" width="5" height="5" />
        <rect x="160" y="20" width="5" height="5" />
        <rect x="140" y="50" width="5" height="5" />
        <rect x="160" y="50" width="5" height="5" />
        <rect x="140" y="80" width="5" height="5" />
        <rect x="160" y="80" width="5" height="5" />

        {/* Skyscraper 3 windows (Lit heavily) */}
        <rect x="240" y="35" width="5" height="5" />
        <rect x="260" y="35" width="5" height="5" />
        <rect x="290" y="25" width="5" height="5" />
        <rect x="310" y="25" width="5" height="5" />
        <rect x="240" y="65" width="5" height="5" />
        <rect x="260" y="65" width="5" height="5" />
        <rect x="290" y="65" width="5" height="5" />
        <rect x="310" y="65" width="5" height="5" />

        {/* Far right building */}
        <rect x="540" y="45" width="5" height="5" />
        <rect x="560" y="45" width="5" height="5" />
        <rect x="540" y="75" width="5" height="5" />
        <rect x="560" y="75" width="5" height="5" />
      </g>
    </svg>
  );
};

// --- 3. The Component ---

const AnimatedDriverButton = ({ t, navigate, isMobile }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { mode } = useSelector((state) => state.theme);
  const isNight = mode === "dark";

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      navigate("/book-driver");
    }, 2000);
  };

  // Select the appropriate sky animation based on system theme
  const selectedSkyAnimation = isNight ? skyToNight : skyToDay;
  const roadColor = isNight
    ? "linear-gradient(to top, #111, #333)"
    : "linear-gradient(to top, #444, #777)";
  const roadBorder = isNight ? "#555" : "#999";

  return (
    <Button
      fullWidth
      variant="contained"
      onClick={handleClick}
      sx={{
        height: isMobile ? 80 : 100,
        fontSize: isMobile ? "1rem" : "1.4rem",
        borderRadius: 3,
        textTransform: "none",
        backgroundColor: "primary.main",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: 6,
        position: "relative",
        overflow: "hidden",
        // Apply the conditional sky animation
        animation: isAnimating ? `${selectedSkyAnimation} 2s forwards` : "none",
        "&:hover .arrow-icon": {
          transform: !isAnimating ? "translateX(10px)" : "none",
        },
      }}
    >
      {/* TEXT CONTENT (Z-Index 30 - Highest layer) */}
      <Box
        sx={{
          zIndex: 30,
          position: "relative",
          textAlign: "center",
          color: "text.primary",
        }}
      >
        {t("dashboard.book_driver")}
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 0.5, opacity: 0.8, fontSize: "0.7rem" }}
        >
          {t("dashboard.sub_driver")}
        </Typography>
      </Box>

      {/* ARROW ICON */}
      <ArrowForwardIcon
        className="arrow-icon"
        sx={{
          transition: "transform 0.3s ease",
          mt: 0.5,
          zIndex: 30,
          opacity: isAnimating ? 0 : 1,
          color: "text.primary"
        }}
      />

      {/* --- ANIMATION SCENE --- */}
      {isAnimating && (
        <>
          {/* 1. Realistic City Skyline (Background) */}
          {/* Pass the isNight prop to toggle windows */}
          <Box
            sx={{
              position: "absolute",
              bottom: "30%", // Sits on top of road
              left: 0,
              width: "100%",
              height: "auto",
              animation: `${elementFadeIn} 0.8s ease-out forwards`,
              zIndex: 1,
            }}
          >
            <RealisticCityIcon isNight={isNight} />
          </Box>

          {/* 2. The Road (Bottom) - Color changes slightly based on theme */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "30%",
              background: roadColor,
              borderTop: `2px solid ${roadBorder}`,
              animation: `${elementFadeIn} 0.5s ease-out forwards`,
              zIndex: 2,
            }}
          />

          {/* 3. The Realistic Car with Passengers */}
          {/* Pass isNight prop to toggle headlights and phone glow brightness */}
          <Box
            sx={{
              position: "absolute",
              bottom: "5px",
              left: "-250px",
              zIndex: 10,
              animation: `${carDriveRealistic} 2.2s ease-in-out forwards`,
            }}
          >
            <SedanWithPeopleIcon isNight={isNight} />
          </Box>
        </>
      )}
    </Button>
  );
};

export default AnimatedDriverButton;
