import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  HelpCircle,
  Save,
  Home,
  ChevronDown,
  Check,
  AlertCircle,
} from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "./AdaptiveBackground";

const Navigation = ({
  currentMode,
  onExit,
  onSave,
  onExitToHome,
  lastSaved,
  onHelpClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null, "success", or "error"
  const { theme, setTheme } = useTheme();
  const menuRef = useRef(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    if (onSave) {
      const saveResult = onSave();
      setSaveStatus(saveResult ? "success" : "error");

      // Auto-dismiss the save status after 2 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }
    setIsOpen(false);
  };

  const handleHome = () => {
    if (onSave) onSave(); // Save before exiting

    // Use the provided callback instead of directly manipulating window.location
    if (onExitToHome) {
      onExitToHome();
    } else if (onExit) {
      // Fallback to onExit if onExitToHome is not provided
      onExit();
    }

    setIsOpen(false);
  };

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark", theme !== "dark");
    setTheme(theme === "dark" ? "light" : "dark");
    setIsOpen(false);
  };

  const handleHelpClick = () => {
    if (onHelpClick) {
      onHelpClick();
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed top-6 left-6 z-50" ref={menuRef}>
        <div className="relative">
          {/* Menu Button */}
          <motion.button
            className="flex items-center justify-center p-2 rounded-lg 
              bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/10
              hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo size="small" />
            <ChevronDown
              className="w-3 h-3 text-[#2C8C7C]/60 ml-1.5"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-48 
                  bg-white/10 dark:bg-black/20 backdrop-blur-md 
                  rounded-lg border border-[#2C8C7C]/10 
                  overflow-hidden"
              >
                <div className="p-1">
                  {/* Theme Toggle */}
                  <motion.button
                    onClick={handleThemeToggle}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      text-sm text-[#2C8C7C] rounded-lg
                      hover:bg-[#2C8C7C]/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </motion.button>

                  {/* Save Button */}
                  <motion.button
                    onClick={handleSave}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      text-sm text-[#2C8C7C] rounded-lg
                      hover:bg-[#2C8C7C]/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={16} />
                    Save Progress
                  </motion.button>

                  {/* Home Button */}
                  <motion.button
                    onClick={handleHome}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      text-sm text-[#2C8C7C] rounded-lg
                      hover:bg-[#2C8C7C]/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Home size={16} />
                    Return Home
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Save Status Notification */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 inset-x-0 mx-auto w-fit z-50 
              px-6 py-3 rounded-lg flex items-center gap-2 shadow-xl
              backdrop-blur-sm
              ${
                saveStatus === "success"
                  ? "bg-[#2C7C8C]/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
          >
            {saveStatus === "success" ? (
              <>
                <Check className="w-5 h-5" />
                <span>Progress saved successfully</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>Failed to save progress</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
