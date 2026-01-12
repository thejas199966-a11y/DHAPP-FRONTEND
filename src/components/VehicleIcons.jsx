import React from "react";
import { Box, Tooltip } from "@mui/material";

// Import your PNG images here. Adjust the path if they are in a different folder.
import SedanImg from "../assets/images/sedan.png";
import SUVImg from "../assets/images/suv.png";
import HatchbackImg from "../assets/images/hatchback.png";
import LuxuryImg from "../assets/images/luxury.png";
import TempoImg from "../assets/images/tempo.png";
import MiniBusImg from "../assets/images/minibus.png";
import BusImg from "../assets/images/full_bus.png";

const DefaultCarImg = SedanImg;

export default function VehicleIcon({ type, height }) {
  let iconSrc;

  switch (type?.toUpperCase()) {
    case "SEDAN":
      iconSrc = SedanImg;
      break;
    case "SUV":
      iconSrc = SUVImg;
      break;
    case "HATCHBACK":
      iconSrc = HatchbackImg;
      break;
    case "LUXURY":
      iconSrc = LuxuryImg;
      break;
    case "TEMPO":
      iconSrc = TempoImg;
      break;
    case "MINIBUS":
      iconSrc = MiniBusImg;
      break;
    case "BUS":
      iconSrc = BusImg;
      break;
    default:
      iconSrc = DefaultCarImg;
  }

  return (
    <Box sx={{ display: "inline-block" }}>
      <Tooltip title={type || "Vehicle"}>
        <img
          src={iconSrc}
          alt={type || "Vehicle"}
          style={{
            height: height || "35px",
            width: "auto",
            objectFit: "contain",
          }}
        />
      </Tooltip>
    </Box>
  );
}
