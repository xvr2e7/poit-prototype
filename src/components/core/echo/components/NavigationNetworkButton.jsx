import React from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";

const NavigationNetworkButton = ({ onClick, isActive }) => {
  return (
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
  );
};

export default NavigationNetworkButton;
