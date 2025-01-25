import React, { useState } from "react";
import Navigation from "./components/shared/Navigation";
import Login from "./components/auth/Login";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import Playground from "./components/playground/PlayMode";
import { TEST_WORDS } from "./utils/TestData";

function App() {
  const [currentMode, setCurrentMode] = useState("pulse");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lockedModes, setLockedModes] = useState({ craft: true, echo: true });
  const [playgroundUnlocked, setPlaygroundUnlocked] = useState(false);
  const [inPlayground, setInPlayground] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);

  const handleTestModeSelect = (mode) => {
    setIsAuthenticated(true);
    if (mode === "craft") {
      // For testing Craft Mode, select 15 random words from TEST_WORDS
      const randomWords = [...TEST_WORDS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 15)
        .map((word) => word.text);
      setSelectedWords(randomWords);
      unlockMode("craft");
    }
    setCurrentMode(mode);
  };

  const unlockMode = (mode) => {
    setLockedModes((prev) => ({ ...prev, [mode]: false }));
  };

  const unlockPlayground = () => {
    setPlaygroundUnlocked(true);
  };

  const enterPlayground = () => {
    setIsAuthenticated(true);
    setInPlayground(true);
  };

  const handlePulseComplete = (words = []) => {
    setSelectedWords(words);
    unlockMode("craft");
    setCurrentMode("craft");
  };

  const handleCraftComplete = () => {
    unlockMode("echo");
    setCurrentMode("echo");
  };

  const renderMode = () => {
    if (inPlayground) {
      return <Playground />;
    }

    switch (currentMode) {
      case "pulse":
        return <PulseMode onComplete={handlePulseComplete} />;
      case "craft":
        return (
          <CraftMode
            onComplete={handleCraftComplete}
            selectedWords={selectedWords}
            enabled={!lockedModes.craft}
          />
        );
      case "echo":
        return (
          <EchoMode
            onComplete={unlockPlayground}
            playgroundUnlocked={playgroundUnlocked}
            enterPlayground={enterPlayground}
            enabled={!lockedModes.echo}
          />
        );
      default:
        return <PulseMode onComplete={handlePulseComplete} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
        <Login
          onLogin={() => setIsAuthenticated(true)}
          enterPlayground={enterPlayground}
          onTestModeSelect={handleTestModeSelect}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {currentMode !== "pulse" && (
        <Navigation
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          lockedModes={lockedModes}
          inPlayground={inPlayground}
        />
      )}
      <main className="flex-1 w-full">{renderMode()}</main>
    </div>
  );
}

export default App;
