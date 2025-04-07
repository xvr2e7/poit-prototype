import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, X } from "lucide-react";
import { useTheme } from "./AdaptiveBackground";

const SettingsMenu = ({ isOpen, onClose, anchorPosition }) => {
  const { theme, setTheme, isDark } = useTheme();

  const handleThemeToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleReset = () => {
    if (window.confirm("Reset all data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Settings panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 w-64 bg-white/10 backdrop-blur-md dark:bg-gray-900/70 
              rounded-xl p-4 border border-[#2C8C7C]/20 shadow-xl"
            style={{
              top: (anchorPosition?.bottom || 0) + 10,
              right:
                window.innerWidth -
                (anchorPosition?.right || window.innerWidth - 10),
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-200">Settings</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Theme toggle */}
              <div className="p-3 rounded-lg bg-white/5 dark:bg-gray-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Theme</span>
                  <button
                    onClick={handleThemeToggle}
                    className="p-2 rounded-lg bg-[#2C8C7C]/10 hover:bg-[#2C8C7C]/20
                      text-[#2C8C7C] transition-colors"
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>
              </div>

              {/* Reset data button */}
              <button
                onClick={handleReset}
                className="w-full p-3 bg-red-500/10 text-red-400 rounded-lg 
                  hover:bg-red-500/20 transition-colors"
              >
                Reset All Data
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
