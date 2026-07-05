import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IconClose,
  IconNib,
  IconPoemlet,
  IconSun,
  IconMoon,
  IconTally,
  IconConstellation,
  IconImport,
  IconExport,
  IconWipe,
} from "../shared/icons";
import { useTheme } from "../shared/AdaptiveBackground";
import DailyPoemPanel from "./DailyPoemPanel";
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
    const savedStreak = localStorage.getItem("poit_streak") || "0";
    const savedLongestStreak =
      localStorage.getItem("poit_longest_streak") || "0";
    const savedTotalConstellations =
      localStorage.getItem("poit_total_constellations") || "0";
    const savedTodayConstellations =
      localStorage.getItem("poit_today_constellations") || "0";
    const savedPoems = JSON.parse(
      localStorage.getItem("poit_poems_history") || "[]"
    );

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
    localStorage.setItem("poit_poems_history", JSON.stringify(updatedPoems));
    setShowWriteAPoem(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-20 flex flex-col md:flex-row overflow-y-auto bg-paper bg-laid"
    >
      {/* Left column — the writing desk */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="font-display font-black text-2xl tracking-[-0.02em] text-ink select-none">
            PO<span className="text-seal">i</span>T
          </span>
          <div className="flex items-center gap-1">
            {/* Theme switch */}
            <button
              onClick={() => setTheme("light")}
              aria-label="Light mode"
              className={`p-1.5 rounded-lg transition-colors ${
                theme === "light" || (theme === "system" && !isDark)
                  ? "bg-seal/10 text-seal"
                  : "text-ink/30 hover:text-ink/60"
              }`}
            >
              <IconSun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              aria-label="Dark mode"
              className={`p-1.5 rounded-lg transition-colors ${
                theme === "dark" || (theme === "system" && isDark)
                  ? "bg-seal/10 text-seal"
                  : "text-ink/30 hover:text-ink/60"
              }`}
            >
              <IconMoon className="w-4 h-4" />
            </button>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
              aria-label="Close menu"
              className="ml-2 p-1.5 rounded-full hover:bg-ink/5 text-ink/30 hover:text-ink/60"
            >
              <IconClose className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Colophon — the ledger of the practice */}
        <div className="max-w-sm w-full mx-auto mt-4 md:mt-10">
          <p className="text-label text-seal/60 mb-3">the record</p>
          <dl className="divide-y divide-ink/10 border-y border-ink/10">
            {[
              { icon: IconTally, label: "current streak", value: `${streak} ${streak === 1 ? "day" : "days"}` },
              { icon: IconTally, label: "longest streak", value: `${longestStreak} ${longestStreak === 1 ? "day" : "days"}` },
              { icon: IconConstellation, label: "constellations today", value: todayConstellations },
              { icon: IconConstellation, label: "constellations in all", value: totalConstellations },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <dt className="flex items-center gap-2 font-mono text-xs text-ink/50">
                  <Icon className="w-3.5 h-3.5 text-ink/30" />
                  {label}
                </dt>
                <dd className="font-serif text-lg text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Actions */}
        <div className="max-w-sm w-full mx-auto space-y-3 mt-10">
          <button
            onClick={onViewHistory}
            className="w-full py-2.5 px-4 border border-seal/30 rounded-md
              hover:bg-seal/5 transition-colors flex items-center justify-center gap-2"
          >
            <IconPoemlet className="w-4 h-4 text-seal" />
            <span className="font-mono text-xs tracking-wide text-seal">Open Poemlet</span>
          </button>

          <button
            onClick={() => setShowWriteAPoem(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4
              bg-seal hover:bg-seal/90 transition-colors rounded-md shadow-leaf dark:shadow-leaf-dark"
          >
            <IconNib className="w-4 h-4 text-paper" />
            <span className="font-mono text-xs tracking-wide text-paper">Write a poem…</span>
          </button>
        </div>

        {/* Save options */}
        <div className="max-w-sm w-full mx-auto mt-auto pt-10 pb-2 flex gap-2">
          <button
            onClick={handleExportSave}
            className="flex items-center justify-center gap-1 px-3 py-1.5 border border-ink/10 rounded-lg
              font-mono text-[11px] text-ink/45 hover:text-ink/70 hover:border-ink/25 transition-colors"
          >
            <IconExport className="w-3 h-3" />
            <span>Export save</span>
          </button>
          <button
            onClick={handleImportSave}
            className="flex items-center justify-center gap-1 px-3 py-1.5 border border-ink/10 rounded-lg
              font-mono text-[11px] text-ink/45 hover:text-ink/70 hover:border-ink/25 transition-colors"
          >
            <IconImport className="w-3 h-3" />
            <span>Import save</span>
          </button>
          <button
            onClick={handleWipeSave}
            className="flex items-center justify-center gap-1 px-3 py-1.5 border border-ink/10 rounded-lg
              font-mono text-[11px] text-ink/45 hover:text-seal hover:border-seal/40 transition-colors"
          >
            <IconWipe className="w-3 h-3" />
            <span>Wipe save</span>
          </button>
        </div>

        {/* Attribution */}
        <p className="max-w-sm w-full mx-auto pb-2 font-mono text-[10px] leading-relaxed text-ink/30">
          Built by{" "}
          <span className="text-ink/50">Ziyan Xie</span>. Supported by the
          Internet Research Initiative at{" "}
          <a
            href="https://uclaconnectionlab.org/"
            className="text-seal/70 hover:text-seal hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            UCLA Connection Lab
          </a>
          .
        </p>
      </div>

      {/* Right column — today's poem from the wider world */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col md:mt-14">
        <p className="text-label text-seal/60 mb-3 mx-4 md:mx-12">
          today&apos;s poem, from the archive
        </p>
        <div className="flex-1 overflow-hidden min-h-[320px]">
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
