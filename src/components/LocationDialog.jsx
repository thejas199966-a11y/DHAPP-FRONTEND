import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { indianCities } from "../data/indianCities";

const LocationDialog = ({ open, onClose, onSelect, onAutoDetect }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Select City
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Auto Detect Option */}
        <List>
          <ListItem
            button
            onClick={onAutoDetect}
            sx={{
              color: "#1976d2",
              border: "1px dashed #1976d2",
              borderRadius: 1,
              mb: 2,
            }}
          >
            <MyLocationIcon sx={{ mr: 2 }} />
            <ListItemText primary="Use Current Location" />
          </ListItem>
        </List>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Choose from list:
        </Typography>

        {/* States & Cities Accordion */}
        {Object.keys(indianCities).map((state) => (
          <Accordion
            key={state}
            expanded={expanded === state}
            onChange={handleChange(state)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{state}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List disablePadding>
                {indianCities[state].map((city) => (
                  <ListItem
                    button
                    key={city}
                    onClick={() => onSelect(city, state)}
                  >
                    <ListItemText primary={city} sx={{ pl: 2 }} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
