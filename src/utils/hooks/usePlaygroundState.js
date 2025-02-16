import { useState } from "react";

export const usePlaygroundState = () => {
  const [currentMode, setCurrentMode] = useState("pulse");
  const [pulseCompleted, setPulseCompleted] = useState(false);
  const [craftCompleted, setCraftCompleted] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [lockedModes, setLockedModes] = useState({ craft: true, echo: true });

  const completePulse = (words) => {
    setSelectedWords(words);
    setPulseCompleted(true);
    setCurrentMode("craft");
    setLockedModes((prev) => ({ ...prev, craft: false }));
  };

  const completeCraft = () => {
    setCraftCompleted(true);
    setLockedModes((prev) => ({ ...prev, echo: false }));
  };

  const restartPulseMode = () => {
    setPulseCompleted(false);
    setCraftCompleted(false);
    setSelectedWords([]);
    setCurrentMode("pulse");
    setLockedModes({ craft: true, echo: true });
  };

  return {
    currentMode,
    pulseCompleted,
    craftCompleted,
    selectedWords,
    lockedModes,
    completePulse,
    completeCraft,
    restartPulseMode,
    setCurrentMode,
  };
};
