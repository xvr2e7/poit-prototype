import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";
import { calculateTimeUntilTomorrow } from "../../../../utils/timeUtils";

export const TimeDisplay = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const { hours, minutes } = calculateTimeUntilTomorrow();
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20">
        <Moon className="w-4 h-4 text-[#2C8C7C]" />
        <div className="relative flex items-center">
          <div className="absolute inset-0 bg-[#2C8C7C]/10 blur-xl rounded-full" />
          <motion.span
            className="text-sm text-[#2C8C7C]"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Resets in {timeLeft}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};
