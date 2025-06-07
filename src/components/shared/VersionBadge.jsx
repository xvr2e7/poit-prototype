import React from "react";
import { motion } from "framer-motion";
import packageJson from "../../../package.json";

const VersionBadge = ({ version = packageJson.version }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      whileHover={{ opacity: 1 }}
      className="fixed bottom-4 left-4 z-10 px-2 py-1 
        bg-white/10 dark:bg-gray-900/30 backdrop-blur-sm 
        border border-[#2C8C7C]/20 rounded-md 
        text-xs text-[#2C8C7C]/80"
    >
      v{version}
    </motion.div>
  );
};

export default VersionBadge;
