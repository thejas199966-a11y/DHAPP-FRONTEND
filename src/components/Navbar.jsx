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
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LanguageIcon from "@mui/icons-material/Language";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../features/languageSlice";
import { logout } from "../features/authSlice";
import { toggleTheme } from "../features/themeSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const location = useLocation();
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenProfileMenu = (event) =>
    setProfileAnchorEl(event.currentTarget);
  const handleCloseProfileMenu = () => setProfileAnchorEl(null);
  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleLogout = () => {
    dispatch(logout());
    handleCloseProfileMenu();
    if (isMobile) setDrawerOpen(false);
  };

  const handleChangeLanguage = (langCode, langLabel) => {
    i18n.changeLanguage(langCode);
    dispatch(setLanguage({ code: langCode, label: langLabel }));
    handleCloseMenu();
  };

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  };

  const renderDesktopMenu = () => (
    <>
      <Tooltip title="Toggle theme">
        <IconButton color="inherit" onClick={handleThemeChange} size="large">
          {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>

      <Box sx={{ ml: 1 }}>
        <Tooltip title="Change Language">
          <IconButton color="inherit" onClick={handleOpenMenu} size="large">
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{ elevation: 4, sx: { mt: 1.5, minWidth: 150 } }}
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
        <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
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
            PaperProps={{ elevation: 4, sx: { mt: 1.5, minWidth: 150 } }}
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
    </>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton
        color="inherit"
        edge="end"
        onClick={toggleDrawer(true)}
        size="large"
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem>
              <Typography variant="h6">DHire Menu</Typography>
            </ListItem>
            <Divider />
            {user ? (
              <>
                <ListItem button>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary={user.name} />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              location.pathname !== "/login" && (
                <>
                  <ListItem button onClick={() => navigate("/login")}>
                    <ListItemIcon>
                      <LoginIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("auth.login")} />
                  </ListItem>
                  <ListItem button onClick={() => navigate("/login")}>
                    <ListItemIcon>
                      <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("auth.signup")} />
                  </ListItem>
                </>
              )
            )}
            <Divider />
            <ListItem button onClick={handleThemeChange}>
              <ListItemIcon>
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </ListItemIcon>
              <ListItemText
                primary={`Theme: ${
                  mode.charAt(0).toUpperCase() + mode.slice(1)
                }`}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Language" />
            </ListItem>
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
          </List>
        </Box>
      </Drawer>
    </>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            DHire
          </span>
        </Typography>

        {isMobile ? renderMobileMenu() : renderDesktopMenu()}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
