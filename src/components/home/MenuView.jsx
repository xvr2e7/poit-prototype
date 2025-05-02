import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Puzzle,
  SquareLibrary,
  Sun,
  Moon,
  Flame,
  Waypoints,
  Upload,
  Download,
  Trash2,
} from "lucide-react";
import { useTheme } from "../shared/AdaptiveBackground";
import DailyPoemPanel from "./DailyPoemPanel";
import Logo from "../shared/Logo";
import WriteAPoem from "./WriteAPoem";

const MenuView = ({ onClose, onStartDaily, onViewHistory }) => {
  const { theme, setTheme, isDark } = useTheme();
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalConstellations, setTotalConstellations] = useState(0);
  const [todayConstellations, setTodayConstellations] = useState(0);
  const [showWriteAPoem, setShowWriteAPoem] = useState(false);
  const [poems, setPoems] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const savedStreak = localStorage.getItem("poit_streak") || 0;
    const savedLongestStreak = localStorage.getItem("poit_longest_streak") || 0;
    const savedTotalConstellations =
      localStorage.getItem("poit_total_constellations") || 0;
    const savedTodayConstellations =
      localStorage.getItem("poit_today_constellations") || 0;
    const savedPoems = JSON.parse(localStorage.getItem("poit_poems") || "[]");

    setStreak(parseInt(savedStreak));
    setLongestStreak(parseInt(savedLongestStreak));
    setTotalConstellations(parseInt(savedTotalConstellations));
    setTodayConstellations(parseInt(savedTodayConstellations));
    setPoems(savedPoems);
  }, []);

  // Handle data management functions
  const handleExportSave = () => {
    try {
      const saveData = {
        streak,
        longestStreak,
        totalConstellations,
        poems: JSON.parse(localStorage.getItem("poit_poems_history") || "[]"),
        created: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(saveData);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportName = `poit_save_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting save:", error);
      alert("Failed to export save data.");
    }
  };

  const handleImportSave = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const saveData = JSON.parse(event.target.result);

          // Validate data format
          if (!saveData.streak && !saveData.poems) {
            throw new Error("Invalid save file format");
          }

          // Import data
          if (saveData.streak)
            localStorage.setItem("poit_streak", saveData.streak);
          if (saveData.longestStreak)
            localStorage.setItem("poit_longest_streak", saveData.longestStreak);
          if (saveData.totalConstellations)
            localStorage.setItem(
              "poit_total_constellations",
              saveData.totalConstellations
            );
          if (saveData.poems)
            localStorage.setItem(
              "poit_poems_history",
              JSON.stringify(saveData.poems)
            );

          // Reload data
          window.location.reload();
        } catch (error) {
          console.error("Error importing save:", error);
          alert("Failed to import save data.");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleWipeSave = () => {
    if (
      window.confirm(
        "Are you sure you want to wipe all save data? This cannot be undone."
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSavePoem = (poem) => {
    const updatedPoems = [...poems, poem];
    setPoems(updatedPoems);
    localStorage.setItem("poit_poems", JSON.stringify(updatedPoems));
    setShowWriteAPoem(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-20 flex"
      style={{
        background: isDark
          ? "linear-gradient(to bottom right, #0f172a, #1e293b)"
          : "linear-gradient(to bottom right, #e6f2ff, #f8fafc)",
      }}
    >
      {/* Left Column */}
      <div className="w-1/2 p-5">
        <div className="h-full flex flex-col">
          {/* Header with Logo */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Logo size="small" />
              <span className="text-[#2C8C7C] text-2xl font-light tracking-wide">
                POiT
              </span>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Theme Switch */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === "light"
                  ? "bg-[#2C8C7C]/10 text-[#2C8C7C]"
                  : "text-gray-500"
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-[#2C8C7C]/10 text-[#2C8C7C]"
                  : "text-gray-500"
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="w-2/3 mx-auto grid grid-cols-2 gap-3 mt-20">
            <div className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 rounded-xl p-3">
              <div className="flex flex-col items-center">
                <Flame className="w-4 h-4 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Current Streak</span>
                <span className="text-xl text-[#2C8C7C] font-light">
                  {streak} days
                </span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 rounded-xl p-3">
              <div className="flex flex-col items-center">
                <Flame className="w-4 h-4 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Longest Streak</span>
                <span className="text-xl text-[#2C8C7C] font-light">
                  {longestStreak} days
                </span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 rounded-xl p-3">
              <div className="flex flex-col items-center">
                <Waypoints className="w-4 h-4 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">
                  Total Constellation
                </span>
                <span className="text-xl text-[#2C8C7C] font-light">
                  {totalConstellations}
                </span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 rounded-xl p-3">
              <div className="flex flex-col items-center">
                <Waypoints className="w-4 h-4 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">
                  Today's Constellation
                </span>
                <span className="text-xl text-[#2C8C7C] font-light">
                  {todayConstellations}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-2/3 mx-auto space-y-3 mt-20">
            <button
              onClick={onViewHistory}
              className="w-full py-2.5 px-4 bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 
                rounded-xl hover:bg-[#2C8C7C]/5 transition-colors text-center flex items-center justify-center gap-2"
            >
              <SquareLibrary className="w-4 h-4 text-[#2C8C7C]" />
              <span className="text-[#2C8C7C]">Poemlet</span>
            </button>

            <button
              onClick={() => setShowWriteAPoem(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 
                bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 transition-colors
                text-white rounded-xl"
            >
              <Puzzle className="w-4 h-4 text-gray-200" />
              <span className="text-gray-200">Write a Poem...</span>
            </button>
          </div>

          {/* Save Options */}
          <div className="mt-auto flex gap-2 w-5/6 mx-auto">
            <button
              onClick={handleExportSave}
              className="flex items-center justify-center gap-1 px-3 py-1.5 border border-[#2C8C7C]/20 rounded-lg text-gray-500 text-xs"
            >
              <Download className="w-3 h-3" />
              <span>Export save</span>
            </button>

            <button
              onClick={handleImportSave}
              className="flex items-center justify-center gap-1 px-3 py-1.5 border border-[#2C8C7C]/20 rounded-lg text-gray-500 text-xs"
            >
              <Upload className="w-3 h-3" />
              <span>Import save</span>
            </button>

            <button
              onClick={handleWipeSave}
              className="flex items-center justify-center gap-1 px-3 py-1.5 border border-[#2C8C7C]/20 rounded-lg text-gray-500 text-xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Wipe save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-1/2 p-5 flex flex-col mt-20">
        <div className="flex-1 overflow-hidden">
          <DailyPoemPanel />
        </div>
      </div>

      {/* Write a Poem Modal */}
      <WriteAPoem
        isOpen={showWriteAPoem}
        onClose={() => setShowWriteAPoem(false)}
        onStartPOiT={onStartDaily}
        onSavePoem={handleSavePoem}
      />
    </motion.div>
  );
};

export default MenuView;
