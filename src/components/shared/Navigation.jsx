import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, HelpCircle, LogOut } from "lucide-react";

function Navigation({
  currentMode,
  setCurrentMode,
  lockedModes,
  inPlayground,
  onExit,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const accentColor = "#2C8C7C";

  return (
    <>
      {/* Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-[100] p-4 rounded-xl
          hover:bg-white/5 active:bg-white/10
          transition-colors duration-200 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative w-7 h-7">
          {/* Menu lines */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 w-7 rounded-full"
              style={{
                backgroundColor: accentColor,
                top: `${i * 9 + 8}px`,
                opacity: 0.95,
                transformOrigin: "center",
                boxShadow: `0 0 10px ${accentColor}40`,
              }}
              initial={false}
              animate={
                isOpen
                  ? {
                      y: i === 1 ? 9 : 0,
                      rotate: i === 0 ? 45 : i === 2 ? -45 : 0,
                      opacity: i === 1 ? 0 : 1,
                      width: i === 1 ? "16px" : "28px",
                    }
                  : {
                      y: 0,
                      rotate: 0,
                      opacity: 0.95,
                      width: "28px",
                    }
              }
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            />
          ))}
        </div>
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[90] backdrop-blur-sm bg-black/10"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              className="fixed top-6 left-[5.5rem] z-[100] w-48
                bg-white/80 dark:bg-gray-900/80 rounded-lg
                border border-[#2C8C7C]/20 overflow-hidden
                backdrop-blur-sm"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              {/* Mode name */}
              <div
                className="px-4 py-3 border-b border-[#2C8C7C]/20"
                style={{ color: accentColor }}
              >
                {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}
              </div>

              {/* Menu options */}
              <div className="p-1">
                <MenuOption
                  icon={Save}
                  label="Save Progress"
                  color={accentColor}
                  onClick={() => setIsOpen(false)}
                />
                <MenuOption
                  icon={HelpCircle}
                  label="Help"
                  color={accentColor}
                  onClick={() => setIsOpen(false)}
                />
                <MenuOption
                  icon={LogOut}
                  label="Return to Menu"
                  color={accentColor}
                  onClick={onExit}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const MenuOption = ({ icon: Icon, label, color, onClick }) => (
  <motion.button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-md
      hover:bg-[#2C8C7C]/5 transition-colors duration-200"
    style={{ color }}
    whileHover={{ x: 4 }}
  >
    <Icon size={16} />
    <span className="text-sm">{label}</span>
  </motion.button>
);

export default Navigation;
