import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconAlert,
  IconAsk,
  IconCheck,
  IconChevronDown,
  IconHome,
  IconMoon,
  IconSave,
  IconSun,
} from "./icons";
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
              bg-surface/60 backdrop-blur-sm border border-seal/15
              hover:bg-seal/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo size="small" />
            <IconChevronDown
              className="w-3 h-3 text-seal/60 ml-1.5"
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
                className="absolute top-full left-0 mt-2 w-52 
                  bg-surface/95 backdrop-blur-md 
                  rounded-lg border border-seal/15 shadow-leaf dark:shadow-leaf-dark
                  overflow-hidden"
              >
                <div className="p-1">
                  {/* Theme Toggle */}
                  <motion.button
                    onClick={handleThemeToggle}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      font-mono text-xs tracking-wide text-seal rounded-lg
                      hover:bg-seal/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </motion.button>

                  {/* Save Button */}
                  <motion.button
                    onClick={handleSave}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      font-mono text-xs tracking-wide text-seal rounded-lg
                      hover:bg-seal/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconSave size={16} />
                    Save progress
                  </motion.button>

                  {/* Home Button */}
                  <motion.button
                    onClick={handleHome}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      font-mono text-xs tracking-wide text-seal rounded-lg
                      hover:bg-seal/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconHome size={16} />
                    Return home
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
              px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-leaf dark:shadow-leaf-dark
              backdrop-blur-sm font-mono text-xs tracking-wide
              ${
                saveStatus === "success"
                  ? "bg-seal text-paper"
                  : "bg-ink text-paper"
              }`}
          >
            {saveStatus === "success" ? (
              <>
                <IconCheck className="w-4 h-4" />
                <span>Progress saved</span>
              </>
            ) : (
              <>
                <IconAlert className="w-4 h-4" />
                <span>Nothing to save yet</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
