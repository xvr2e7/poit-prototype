import React, { useState } from "react";
import { AdaptiveBackground } from "./components/shared/AdaptiveBackground";
import HomePage from "./components/home/HomePage";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";

function App() {
  // Simple navigation state
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);

  // Handler functions
  const handleStartDaily = () => {
    setCurrentScreen("pulse");
  };

  const handleViewHistory = () => {
    // For now, just log - we'll implement history view later
    console.log("View history clicked");
  };

  const handlePulseComplete = (words) => {
    setSelectedWords(words);

    // Save to localStorage
    localStorage.setItem("poit_daily_words", JSON.stringify(words));

    setCurrentScreen("craft");
  };

  const handleCraftComplete = (poemData) => {
    const processedPoem = {
      ...poemData,
      title: "Today's Poem",
      createdAt: new Date().toISOString(),
      selectedWords,
    };

    setCurrentPoem(processedPoem);

    // Save to localStorage
    localStorage.setItem("poit_current_poem", JSON.stringify(processedPoem));

    setCurrentScreen("echo");
  };

  const handleEchoComplete = () => {
    // Save completed poem to history
    const poemsHistory = JSON.parse(
      localStorage.getItem("poit_poems_history") || "[]"
    );
    poemsHistory.unshift({
      ...currentPoem,
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem(
      "poit_poems_history",
      JSON.stringify(poemsHistory.slice(0, 10))
    ); // Keep last 10

    // Update streak
    const streak = parseInt(localStorage.getItem("poit_streak") || "0");
    localStorage.setItem("poit_streak", (streak + 1).toString());

    // Return to home
    setCurrentScreen("home");
  };

  // Render based on current screen
  return (
    <div className="min-h-screen">
      <AdaptiveBackground />

      {currentScreen === "home" && (
        <HomePage
          onStartDaily={handleStartDaily}
          onViewHistory={handleViewHistory}
        />
      )}

      {currentScreen === "pulse" && (
        <PulseMode onComplete={handlePulseComplete} />
      )}

      {currentScreen === "craft" && (
        <CraftMode
          selectedWords={selectedWords}
          onComplete={handleCraftComplete}
        />
      )}

      {currentScreen === "echo" && (
        <EchoMode
          poems={[currentPoem].filter(Boolean)}
          wordPool={selectedWords}
          onComplete={handleEchoComplete}
        />
      )}
    </div>
  );
}

export default App;
