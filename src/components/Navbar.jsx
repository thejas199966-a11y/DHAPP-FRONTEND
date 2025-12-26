import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LanguageIcon from "@mui/icons-material/Language"; // The Globe Icon
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../features/languageSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.logins);

  const { t, i18n } = useTranslation(); // The hook to translate text
  const dispatch = useDispatch();

  // State for the Popup Menu (Anchor element)
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChangeLanguage = (langCode, langLabel) => {
    i18n.changeLanguage(langCode);

    dispatch(setLanguage({ code: langCode, label: langLabel }));

    handleCloseMenu();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#448cebff" }}>
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 1, ml: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/">
            DhApp
          </Button>
        </Typography>

        {/* --- LANGUAGE SWITCHER SECTION --- */}
        <Box sx={{ ml: 2 }}>
          <Tooltip title="Change Language">
            <IconButton color="inherit" onClick={handleOpenMenu} size="large">
              <LanguageIcon />
            </IconButton>
          </Tooltip>

          {/* The Popup Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              elevation: 4,
              sx: { mt: 1.5, minWidth: 150 },
            }}
          >
            <MenuItem
              selected={i18n.language === "en"}
              onClick={() => handleChangeLanguage("en", "English")}
            >
              🇺🇸 English
            </MenuItem>
            <MenuItem
              selected={i18n.language === "kn"}
              onClick={() => handleChangeLanguage("kn", "Kannada")}
            >
              🇮🇳 ಕನ್ನಡ (Kannada)
            </MenuItem>
            <MenuItem
              selected={i18n.language === "hi"}
              onClick={() => handleChangeLanguage("hi", "Hindi")}
            >
              🇮🇳 हिंदी (Hindi)
            </MenuItem>
          </Menu>
        </Box>

        {user ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2, ml: 2 }}>
              Hello, {user}
            </Typography>
          </Box>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              {t('auth.login')}
            </Button>
            <Button color="inherit" component={Link} to="/login">
              {t('auth.signup')}
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
