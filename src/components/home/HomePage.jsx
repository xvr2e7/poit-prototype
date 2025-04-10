import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Calendar } from "lucide-react";
import DynamicLogo from "../shared/DynamicLogo";
import { calculateTimeUntilTomorrow } from "../../utils/timeUtils";
import MenuView from "./MenuView";

const HomePage = ({ onStartDaily, onViewHistory }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setTimeLeft(calculateTimeUntilTomorrow());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {menuOpen ? (
          <MenuView
            key="menu-view"
            onClose={() => setMenuOpen(false)}
            onStartDaily={onStartDaily}
            onViewHistory={onViewHistory}
          />
        ) : (
          <motion.div
            key="initial-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            {/* Menu Button */}
            <motion.button
              className="absolute top-6 left-6 p-3 rounded-xl
                bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20
                hover:bg-white/10 transition-colors"
              onClick={toggleMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5 text-[#2C8C7C]" />
            </motion.button>

            {/* Main Logo - clickable to start */}
            <motion.div className="mb-16 relative group" onClick={onStartDaily}>
              {/* Pulsing circle behind logo to indicate clickability */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#2C8C7C]/5"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 0.2, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Subtle text hint that appears on hover */}
              <motion.div
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[#2C8C7C]/80 text-sm"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Click to begin
              </motion.div>

              {/* Only place where DynamicLogo should be used */}
              <DynamicLogo size="large" animate={true} />
            </motion.div>

            {/* Countdown Box */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 
                rounded-xl p-4 flex flex-col items-center"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Next Words</span>
              </div>
              <p className="text-2xl font-light text-[#2C8C7C]">
                {timeLeft.hours}h {timeLeft.minutes}m
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
