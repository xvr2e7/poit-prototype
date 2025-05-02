import React from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";

const NavigationNetworkButton = ({ onClick, isActive }) => {
  return (
    <div className="relative group">
      <motion.button
        onClick={onClick}
        className={`p-2 rounded-lg 
          ${isActive ? "bg-[#2C8C7C]/20" : "bg-white/5 dark:bg-gray-900/20"} 
          backdrop-blur-sm border border-[#2C8C7C]/20 
          hover:bg-[#2C8C7C]/10 transition-colors`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="View poem network"
      >
        <Network className="w-5 h-5 text-[#2C8C7C]" />
      </motion.button>
      {/* Tooltip */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 
        bg-gray-200/90 dark:bg-gray-700/90 backdrop-blur-sm rounded text-xs whitespace-nowrap 
        text-[#2C8C7C]
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        Constellation
      </div>
    </div>
  );
};
export default NavigationNetworkButton;
