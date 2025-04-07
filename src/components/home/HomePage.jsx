import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Award, ArrowRight, BookOpen, Settings } from "lucide-react";
import { calculateTimeUntilTomorrow } from "../../utils/timeUtils";
import { useTheme } from "../shared/AdaptiveBackground";
import SettingsMenu from "../shared/SettingsMenu";

const HomePage = ({ onStartDaily, onViewHistory }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [streak, setStreak] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const { isDark } = useTheme();
  const [iconSrc, setIconSrc] = useState("/favicon_light.svg");
  const settingsBtnRef = useRef(null);
  const [settingsPosition, setSettingsPosition] = useState(null);

  useEffect(() => {
    setIconSrc(isDark ? "/favicon_dark.svg" : "/favicon_light.svg");
  }, [isDark]);

  useEffect(() => {
    const updateTime = () => {
      setTimeLeft(calculateTimeUntilTomorrow());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedStreak = localStorage.getItem("poit_streak") || 0;
    setStreak(parseInt(savedStreak));
  }, []);

  const handleOpenSettings = () => {
    if (settingsBtnRef.current) {
      const rect = settingsBtnRef.current.getBoundingClientRect();
      setSettingsPosition(rect);
    }
    setShowSettings(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Logo and title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-12 text-center"
      >
        <img src={iconSrc} alt="POiT" className="w-24 h-24 mx-auto mb-4" />
      </motion.div>

      {/* Main content */}
      <div className="w-full max-w-md">
        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {/* Next Words Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/30 rounded-xl p-4 flex flex-col items-center">
            <Calendar className="w-6 h-6 text-[#2C8C7C] mb-2" />
            <h2 className="text-sm text-gray-400">Next Words</h2>
            <p className="text-2xl font-light text-[#2C8C7C]">
              {timeLeft.hours}h {timeLeft.minutes}m
            </p>
          </div>

          {/* Streak Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/30 rounded-xl p-4 flex flex-col items-center">
            <Award className="w-6 h-6 text-[#2C8C7C] mb-2" />
            <h2 className="text-sm text-gray-400">Your Streak</h2>
            <p className="text-2xl font-light text-[#2C8C7C]">{streak} days</p>
          </div>
        </motion.div>

        {/* Call to action section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/30 rounded-xl p-6 mb-4"
        >
          <div className="flex justify-center space-x-6 mb-6">
            {/* Visual steps */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#2C8C7C]/20 flex items-center justify-center mb-2">
                <span className="text-[#2C8C7C]">P</span>
              </div>
              <span className="text-xs text-gray-400">PULSE</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#2C8C7C]/20 flex items-center justify-center mb-2">
                <span className="text-[#2C8C7C]">C</span>
              </div>
              <span className="text-xs text-gray-400">CRAFT</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#2C8C7C]/20 flex items-center justify-center mb-2">
                <span className="text-[#2C8C7C]">E</span>
              </div>
              <span className="text-xs text-gray-400">ECHO</span>
            </div>
          </div>

          <button
            onClick={onStartDaily}
            className="w-full py-4 rounded-xl bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 
              text-white font-medium flex items-center justify-center gap-2 mb-4"
          >
            <span>POiT!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* History Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onViewHistory}
          className="w-full py-3 rounded-xl bg-white/5 backdrop-blur-sm 
            border border-[#2C8C7C]/30 hover:bg-[#2C8C7C]/10
            text-[#2C8C7C] font-medium flex items-center justify-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          <span>View Your Poems</span>
        </motion.button>
      </div>

      {/* Settings button */}
      <button
        ref={settingsBtnRef}
        onClick={handleOpenSettings}
        className="absolute top-4 right-4 p-2 rounded-full
          hover:bg-[#2C8C7C]/10 text-[#2C8C7C]/70"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Menu Component */}
      <SettingsMenu
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        anchorPosition={settingsPosition}
      />
    </div>
  );
};

export default HomePage;
