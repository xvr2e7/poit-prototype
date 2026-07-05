import React from "react";
import { motion } from "framer-motion";
import { IconConstellation } from "../../../shared/icons";

const NavigationNetworkButton = ({ onClick, isActive }) => {
  return (
    <div className="relative group">
      <motion.button
        onClick={onClick}
        className={`p-2 rounded-lg 
          ${isActive ? "bg-seal/20" : "bg-surface/60"} 
          backdrop-blur-sm border border-seal/20 
          hover:bg-seal/10 transition-colors`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="View poem network"
      >
        <IconConstellation className="w-5 h-5 text-seal" />
      </motion.button>
      {/* Tooltip */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 
        bg-surface/95 border border-ink/10 backdrop-blur-sm rounded font-mono text-xs whitespace-nowrap 
        text-seal
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        Constellation
      </div>
    </div>
  );
};
export default NavigationNetworkButton;
