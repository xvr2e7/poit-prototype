import { useState } from "react";

export const usePlaygroundState = () => {
  const [currentMode, setCurrentMode] = useState("pulse");
  const [pulseCompleted, setPulseCompleted] = useState(false);
  const [craftCompleted, setCraftCompleted] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);

  const completePulse = (words) => {
    setSelectedWords(words);
    setPulseCompleted(true);
    setCurrentMode("craft");
  };

  const completeCraft = () => {
    setCraftCompleted(true);
  };

  const restartPulseMode = () => {
    setPulseCompleted(false);
    setCraftCompleted(false);
    setSelectedWords([]);
    setCurrentMode("pulse");
  };

  return {
    currentMode,
    pulseCompleted,
    craftCompleted,
    selectedWords,
    completePulse,
    completeCraft,
    restartPulseMode,
    setCurrentMode,
  };
};
