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
  Avatar,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LanguageIcon from "@mui/icons-material/Language"; // The Globe Icon
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../features/languageSlice";
import { logout } from "../features/authSlice";
import { toggleTheme } from "../features/themeSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const location = useLocation();

  const { t, i18n } = useTranslation(); // The hook to translate text
  const dispatch = useDispatch();

  // State for the Popup Menu (Anchor element)
  const [anchorEl, setAnchorEl] = useState(null);

  // State for profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleCloseProfileMenu();
  };

  const handleChangeLanguage = (langCode, langLabel) => {
    i18n.changeLanguage(langCode);

    dispatch(setLanguage({ code: langCode, label: langLabel }));

    handleCloseMenu();
  };

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 1, ml: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/">
            DHire
          </Button>
        </Typography>

        {/* --- THEME TOGGLE BUTTON --- */}
        <Tooltip title="Toggle theme">
          <IconButton color="inherit" onClick={handleThemeChange} size="large">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

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
            <Tooltip title="Profile">
              <IconButton onClick={handleOpenProfileMenu} sx={{ p: 1 }}>
                <Avatar
                  alt={user.name}
                  src={user.picture || "https://via.placeholder.com/40?text=U"}
                  sx={{ width: 35, height: 35 }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleCloseProfileMenu}
              PaperProps={{
                elevation: 4,
                sx: { mt: 1.5, minWidth: 150 },
              }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          location.pathname !== "/login" && (
            <>
              <Button color="inherit" component={Link} to="/login">
                {t("auth.login")}
              </Button>
              <Button color="inherit" component={Link} to="/login">
                {t("auth.signup")}
              </Button>
            </>
          )
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
