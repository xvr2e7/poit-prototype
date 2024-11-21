import React, { useState } from "react";
import Navigation from "./components/shared/Navigation";
import Login from "./components/auth/Login";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import Playground from "./components/playground/PlayMode";
import "./styles/index.css";

function App() {
  const [currentMode, setCurrentMode] = useState("pulse");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lockedModes, setLockedModes] = useState({ craft: true, echo: true });
  const [playgroundUnlocked, setPlaygroundUnlocked] = useState(false);
  const [inPlayground, setInPlayground] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);

  const unlockMode = (mode) => {
    console.log(`Unlocking ${mode} mode`); // Debug log
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
    console.log("Pulse completed with words:", words);
    setSelectedWords(words);
    unlockMode("craft");
  };

  const handleCraftComplete = () => {
    console.log("Craft completed"); // Debug log
    unlockMode("echo");
    // Automatically switch to echo mode when craft is completed
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
            // Add an enabled prop to control when craft mode can be used
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
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <Navigation
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        lockedModes={lockedModes}
        inPlayground={inPlayground}
        className="bg-white shadow-md"
      />
      <main className="flex-1 w-full">{renderMode()}</main>
    </div>
  );
}

export default App;
