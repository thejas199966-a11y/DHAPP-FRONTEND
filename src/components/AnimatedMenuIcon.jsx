import React from "react";
import { motion } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const AnimatedMenuIcon = ({ isOpen }) => {
  return (
    <motion.div
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </motion.div>
  );
};

export default AnimatedMenuIcon;
