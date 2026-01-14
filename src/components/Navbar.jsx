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
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../features/languageSlice";
import { logout } from "../features/authSlice";
import { toggleTheme } from "../features/themeSlice";
import { openLoginModal } from "../features/authModalSlice";
import AccountModal from "./AccountModal";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // --- Handlers ---
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenProfileMenu = (event) =>
    setProfileAnchorEl(event.currentTarget);
  const handleCloseProfileMenu = () => setProfileAnchorEl(null);
  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const handleOpenAccountModal = () => {
    setAccountModalOpen(true);
    handleCloseProfileMenu();
  };
  const handleCloseAccountModal = () => setAccountModalOpen(false);
  const handleLogout = () => {
    dispatch(logout());
    handleCloseProfileMenu();
    if (isMobile) setDrawerOpen(false);
    navigate("/", { replace: true });
  };
  const handleLoginClick = () =>
    dispatch(openLoginModal({ initialView: "login" }));
  const handleSignupClick = () =>
    dispatch(openLoginModal({ initialView: "signup" }));
  const handleChangeLanguage = (langCode, langLabel) => {
    i18n.changeLanguage(langCode);
    dispatch(setLanguage({ code: langCode, label: langLabel }));
    handleCloseMenu();
  };
  const handleThemeChange = () => dispatch(toggleTheme());

  // --- STYLES & ANIMATIONS ---
  const buttonHoverSx = {
    color: "#FFFFFF",
    fontWeight: "bold",
    position: "relative",
    overflow: "hidden", // Keeps the shine inside/near border
    zIndex: 1,
    mx: 1,
    "&:hover": {
      backgroundColor: "#000", // Keep background black so only border shines
    },
    // The "border" container for the shine
    "&::before": {
      content: '""',
      position: "absolute",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      background:
        "conic-gradient(transparent, transparent, transparent, #ffffff)",
      animation: "rotate 4s linear infinite", // Clockwise rotation
      opacity: 0,
      transition: "opacity 0.3s ease",
      zIndex: -1,
    },
    // The inner mask to make it look like a border
    "&::after": {
      content: '""',
      position: "absolute",
      inset: "2px", // Thickness of the border
      background: "#000000", // Matches Navbar bg
      borderRadius: "inherit",
      zIndex: -1,
    },
    "&:hover::before": {
      opacity: 1,
    },
  };

  // Styles for Circular Icons (Icon Buttons)
  const iconHoverSx = {
    color: "#FFFFFF",
    fontWeight: "bold",
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
    "&:hover": {
      backgroundColor: "transparent",
    },
    // The rotating shine
    "&::before": {
      content: '""',
      position: "absolute",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      background:
        "conic-gradient(transparent, transparent, transparent, #ffffff)",
      animation: "rotate 4s linear infinite",
      opacity: 0,
      transition: "opacity 0.3s ease",
      zIndex: -1,
    },
    // The inner mask (Circular)
    "&::after": {
      content: '""',
      position: "absolute",
      inset: "2px",
      background: "#000000",
      borderRadius: "50%", // Circular mask
      zIndex: -1,
    },
    "&:hover::before": {
      opacity: 1,
    },
  };

  return (
    <>
      <style>
        {`
          /* Slide Right (Left -> Right) */
          @keyframes slideRight {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          /* Slide Left (Right -> Left) */
          @keyframes slideLeft {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          /* Rotate Clockwise */
          @keyframes rotate {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <AppBar
        position="static"
        sx={{
          backgroundColor: "#000000",
          position: "relative",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.8)",

          // --- TOP & BOTTOM BORDERS ---
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            left: 0,
            width: "100%",
            height: "2px",
            // The Shine Gradient
            background:
              "linear-gradient(90deg, transparent 0%, rgba(100,100,100,0) 25%, rgba(255,255,255,1) 50%, rgba(100,100,100,0) 75%, transparent 100%)",
            backgroundSize: "200% 100%",
            zIndex: 10,
          },

          // TOP BORDER: Left -> Right
          "&::before": {
            top: 0,
            animation: "slideRight 5s linear infinite",
          },

          // BOTTOM BORDER: Right -> Left
          "&::after": {
            bottom: 0,
            animation: "slideLeft 5s linear infinite",
          },
        }}
      >
        <Toolbar>
          <DirectionsCarIcon sx={{ mr: 1, color: "white" }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              color: "white",
              letterSpacing: "0.5px",
            }}
          >
            <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              DHire
            </span>
          </Typography>

          {isMobile ? (
            // Mobile Menu Button
            <>
              <IconButton
                edge="end"
                onClick={toggleDrawer(true)}
                size="large"
                sx={iconHoverSx} // Apply circular shine
              >
                <MenuIcon />
              </IconButton>
              {/* Drawer Content */}
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                <Box
                  sx={{ width: 250 }}
                  role="presentation"
                  onClick={toggleDrawer(false)}
                  onKeyDown={toggleDrawer(false)}
                >
                  {/* ... (Drawer content remains standard list, no shine needed inside drawer usually) ... */}
                  <List>
                    <ListItem>
                      <Typography variant="h6">{user.name}</Typography>
                    </ListItem>
                    <Divider />
                    {user ? (
                      <>
                        <ListItem button onClick={handleOpenAccountModal}>
                          <ListItemText primary="Account" />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                          <ListItemText primary="Logout" />
                        </ListItem>
                      </>
                    ) : (
                      <>
                        <ListItem button onClick={handleLoginClick}>
                          <ListItemText primary={t("auth.login")} />
                        </ListItem>
                        <ListItem button onClick={handleSignupClick}>
                          <ListItemText primary={t("auth.signup")} />
                        </ListItem>
                      </>
                    )}
                    <Divider />
                    <ListItem button onClick={handleThemeChange}>
                      <ListItemText primary={`Theme: ${mode}`} />
                    </ListItem>
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            // Desktop Actions
            <>
              <Tooltip title="Toggle theme">
                <IconButton
                  onClick={handleThemeChange}
                  size="large"
                  sx={iconHoverSx}
                >
                  {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              <Box sx={{ ml: 1 }}>
                <Tooltip title="Change Language">
                  <IconButton
                    onClick={handleOpenMenu}
                    size="large"
                    sx={iconHoverSx}
                  >
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
                    <IconButton
                      onClick={handleOpenProfileMenu}
                      sx={{ ...iconHoverSx, p: 0.5 }}
                    >
                      {/* Adjusted Avatar to fit inside the circular mask */}
                      <Avatar
                        alt={user.name}
                        src={
                          user.picture ||
                          "https://via.placeholder.com/40?text=U"
                        }
                        sx={{
                          width: 35,
                          height: 35,
                          border: "1px solid white",
                          color: "white",
                          backgroundColor: "black",
                          zIndex: 2,
                        }}
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
                    <MenuItem onClick={handleOpenAccountModal}>
                      Account
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </Box>
              ) : (
                <>
                  <Button sx={buttonHoverSx} onClick={handleLoginClick}>
                    {t("auth.login")}
                  </Button>
                  <Button sx={buttonHoverSx} onClick={handleSignupClick}>
                    {t("auth.signup")}
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
        {user && (
          <AccountModal
            open={accountModalOpen}
            onClose={handleCloseAccountModal}
          />
        )}
      </AppBar>
    </>
  );
};

export default Navbar;
