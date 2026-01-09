import React, { useState, useEffect } from "react";
import { Button, Typography, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { keyframes } from "@emotion/react";

// --- 0. Helper Hook for System Theme Detection ---
const useSystemTheme = () => {
  const [isDark, setIsDark] = useState(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setIsDark(e.matches);

    if (matchMedia.addEventListener) {
      matchMedia.addEventListener("change", handleChange);
    } else {
      matchMedia.addListener(handleChange);
    }

    return () => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener("change", handleChange);
      } else {
        matchMedia.removeListener(handleChange);
      }
    };
  }, []);

  return isDark;
};

// --- 1. Define Animations ---

// Sky Animations
const skyToDay = keyframes`
  0% { background-color: #2f34cfff; }
  100% { background-color: #87CEEB; } /* Foggy Day Blue */
`;

const skyToNight = keyframes`
  0% { background-color: #2f34cfff; }
  100% { background-color: #0d1117; } /* Deep Night */
`;

// Road and Mountain Fading In
const elementFadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Vehicles moving Left to Right
const driveAcross = keyframes`
  0% { transform: translateX(-150px); }
  100% { transform: translateX(500px); }
`;

// Distant birds floating slowly
const flyDistantBirds = keyframes`
  0% { opacity: 0; transform: translate(0, 5px) scale(0.9); }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; transform: translate(20px, -5px) scale(1); }
`;

// --- 2. Define SVG Assets with Dynamic Props ---

// Shared Headlight Definition (Used in all cars)
const HeadlightBeam = () => (
  // Beam pointing Left (because cars are drawn facing left, then flipped via CSS)
  <path
    d="M10,50 L-100,20 L-100,80 Z"
    fill="url(#headlightGradient)"
    opacity="0.6"
  />
);

// Gradient Definition Component
const VehicleDefs = () => (
  <defs>
    <linearGradient id="headlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.0" />{" "}
      {/* Far end (fade out) */}
      <stop offset="100%" stopColor="#fff9c4" stopOpacity="0.9" />{" "}
      {/* Source (bright) */}
    </linearGradient>
  </defs>
);

const SedanIcon = ({ isNight }) => (
  <svg
    width="60"
    height="30"
    viewBox="0 0 200 80"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "scaleX(-1)" }}
  >
    <VehicleDefs />
    {/* Headlights (Only at Night) */}
    {isNight && (
      <path
        d="M10,50 L-80,30 L-80,70 Z"
        fill="url(#headlightGradient)"
        opacity="0.5"
      />
    )}
    {/* Body */}
    <path d="M10,55 Q10,40 25,38 L50,35 L70,15 L140,15 L160,35 L190,38 Q200,40 195,55 H10 Z" />
    <path
      d="M75,18 L135,18 L150,33 L60,33 L75,18 Z"
      fill="#2f34cf"
      fillOpacity="0.5"
    />
    <circle cx="45" cy="55" r="12" fill="black" />{" "}
    <circle cx="45" cy="55" r="8" fill="#ddd" />
    <circle cx="160" cy="55" r="12" fill="black" />{" "}
    <circle cx="160" cy="55" r="8" fill="#ddd" />
  </svg>
);

const SUVIcon = ({ isNight }) => (
  <svg
    width="65"
    height="35"
    viewBox="0 0 200 90"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "scaleX(-1)" }}
  >
    <VehicleDefs />
    {isNight && (
      <path
        d="M10,60 L-80,40 L-80,80 Z"
        fill="url(#headlightGradient)"
        opacity="0.5"
      />
    )}
    <path d="M10,65 Q10,45 20,45 L30,42 L50,15 L150,15 L170,42 L190,45 Q195,45 195,65 H10 Z" />
    <path
      d="M55,19 L95,19 L95,40 L38,40 L55,19 Z"
      fill="#2f34cf"
      fillOpacity="0.5"
    />
    <path
      d="M100,19 L145,19 L162,40 L100,40 L100,19 Z"
      fill="#2f34cf"
      fillOpacity="0.5"
    />
    <rect x="60" y="12" width="80" height="3" rx="1.5" />
    <circle cx="45" cy="65" r="14" fill="black" />{" "}
    <circle cx="45" cy="65" r="9" fill="#ddd" />
    <circle cx="160" cy="65" r="14" fill="black" />{" "}
    <circle cx="160" cy="65" r="9" fill="#ddd" />
  </svg>
);

const TempoIcon = ({ isNight }) => (
  <svg
    width="75"
    height="40"
    viewBox="0 0 220 100"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "scaleX(-1)" }}
  >
    <VehicleDefs />
    {isNight && (
      <path
        d="M5,70 L-80,50 L-80,90 Z"
        fill="url(#headlightGradient)"
        opacity="0.5"
      />
    )}
    <path d="M5,80 Q5,40 15,35 L40,10 L160,10 L210,10 L210,80 H5 Z" />
    <path
      d="M45,15 L75,15 L75,45 L30,45 L45,15 Z"
      fill="#2f34cf"
      fillOpacity="0.5"
    />
    <rect
      x="80"
      y="15"
      width="40"
      height="30"
      fill="#2f34cf"
      fillOpacity="0.5"
    />
    <rect
      x="125"
      y="15"
      width="40"
      height="30"
      fill="#2f34cf"
      fillOpacity="0.5"
    />
    <path
      d="M170,15 L205,15 L205,45 L170,45 Z"
      fill="#2f34cf"
      fillOpacity="0.5"
    />
    <circle cx="45" cy="80" r="14" fill="black" />{" "}
    <circle cx="45" cy="80" r="9" fill="#ddd" />
    <circle cx="170" cy="80" r="14" fill="black" />{" "}
    <circle cx="170" cy="80" r="9" fill="#ddd" />
  </svg>
);

const BirdsGroupIcon = ({ isNight }) => (
  <svg
    width="80"
    height="40"
    viewBox="0 0 120 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity: isNight ? 0.3 : 0.7 }}
  >
    <path
      d="M10 30 C 15 25, 25 25, 30 30"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M50 15 C 55 10, 65 10, 70 15"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M80 35 C 85 30, 95 30, 100 35"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MountainIcon = ({ isNight }) => {
  // Night: Pitch black silhouette (#050505) with high opacity
  // Day: Foggy blue-grey (#607d8b) with low opacity
  const mountainColor = isNight ? "#000000" : "#607d8b";
  const mountainOpacity = isNight ? 1 : 0.4;

  return (
    <svg
      width="100%"
      height="80"
      viewBox="0 0 500 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0,100 L0,60 Q80,20 150,50 Q250,90 350,30 Q450,0 500,40 L500,100 Z"
        fill={mountainColor}
        fillOpacity={mountainOpacity}
      />
    </svg>
  );
};

// --- 3. The Component ---

const AnimatedTravelButton = ({ t, navigate, isMobile }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const isSystemDark = useSystemTheme();

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      navigate("/book-travel");
    }, 2000);
  };

  const selectedSkyAnimation = isSystemDark ? skyToNight : skyToDay;
  const roadColor = isSystemDark
    ? "linear-gradient(to top, #111, #333)"
    : "linear-gradient(to top, #333, #666)";

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
        backgroundColor: "#2f34cfff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: 6,
        position: "relative",
        overflow: "hidden",
        // Sky Animation
        animation: isAnimating ? `${selectedSkyAnimation} 2s forwards` : "none",
        "&:hover .arrow-icon": {
          transform: !isAnimating ? "translateX(10px)" : "none",
        },
      }}
    >
      {/* TEXT CONTENT */}
      <Box sx={{ zIndex: 20, position: "relative", textAlign: "center" }}>
        {t("dashboard.book_travel")}
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 0.5, opacity: 0.8, fontSize: "0.7rem" }}
        >
          {t("dashboard.sub_travel")}
        </Typography>
      </Box>

      {/* ARROW ICON */}
      <ArrowForwardIcon
        className="arrow-icon"
        sx={{
          transition: "transform 0.3s ease",
          mt: 0.5,
          zIndex: 20,
          opacity: isAnimating ? 0 : 1,
        }}
      />

      {/* --- ANIMATION SCENE --- */}
      {isAnimating && (
        <>
          {/* 1. Distant Birds Group (Top Center/Right) */}
          <Box
            sx={{
              position: "absolute",
              top: "5%",
              right: "15%",
              animation: `${flyDistantBirds} 2.5s ease-out forwards`,
              zIndex: 2,
            }}
          >
            <BirdsGroupIcon isNight={isSystemDark} />
          </Box>

          {/* 2. Foggy Mountain Background (Behind road) */}
          <Box
            sx={{
              position: "absolute",
              bottom: "35%",
              left: 0,
              width: "100%",
              height: "auto",
              animation: `${elementFadeIn} 0.8s ease-out forwards`,
              zIndex: 1,
            }}
          >
            <MountainIcon isNight={isSystemDark} />
          </Box>

          {/* 3. The Road (Bottom) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "35%",
              background: roadColor,
              borderTop: "2px solid white",
              animation: `${elementFadeIn} 0.5s ease-out forwards`,
              zIndex: 2,
            }}
          />

          {/* 4. The Vehicles (Convoy) */}

          {/* Car 1: Sedan */}
          <Box
            sx={{
              position: "absolute",
              bottom: "10px",
              left: "-70px",
              zIndex: 10,
              animation: `${driveAcross} 1.8s linear forwards`,
            }}
          >
            <SedanIcon isNight={isSystemDark} />
          </Box>

          {/* Car 2: SUV */}
          <Box
            sx={{
              position: "absolute",
              bottom: "12px",
              left: "-80px",
              zIndex: 10,
              animation: `${driveAcross} 1.9s linear forwards`,
              animationDelay: "0.2s",
            }}
          >
            <SUVIcon isNight={isSystemDark} />
          </Box>

          {/* Car 3: Tempo */}
          <Box
            sx={{
              position: "absolute",
              bottom: "14px",
              left: "-90px",
              zIndex: 10,
              animation: `${driveAcross} 2.0s linear forwards`,
              animationDelay: "0.4s",
            }}
          >
            <TempoIcon isNight={isSystemDark} />
          </Box>
        </>
      )}
    </Button>
  );
};

export default AnimatedTravelButton;
