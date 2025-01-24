import React, { useState } from "react";
import Navigation from "./components/shared/Navigation";
import Login from "./components/auth/Login";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import Playground from "./components/playground/PlayMode";

// [TEST MODE] Import WORD_LIST for test mode word selection
import { WORD_LIST } from "./components/core/pulse/components/WordPool";

function App() {
  const [currentMode, setCurrentMode] = useState("pulse");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lockedModes, setLockedModes] = useState({ craft: true, echo: true });
  const [playgroundUnlocked, setPlaygroundUnlocked] = useState(false);
  const [inPlayground, setInPlayground] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);

  // [TEST MODE] Add state to track when we're in test mode
  const [isTestMode, setIsTestMode] = useState(false);

  // [TEST MODE] Enhanced handleTestModeSelect for direct mode access
  const handleTestModeSelect = (mode) => {
    setIsAuthenticated(true);
    setCurrentMode(mode);

    if (mode === "craft") {
      // For test mode, select 15 random words from WORD_LIST
      const shuffled = [...WORD_LIST]
        .sort(() => 0.5 - Math.random())
        .slice(0, 15)
        .map((word) => word.text);
      setSelectedWords(shuffled);
      setLockedModes((prev) => ({ ...prev, craft: false }));
      setIsTestMode(true);
    }
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
            // [TEST MODE] Modified enabled prop to allow access in test mode
            enabled={!lockedModes.craft || isTestMode}
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
          // [TEST MODE] Pass the test mode handler to Login component
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
