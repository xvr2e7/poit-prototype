import React, { useState } from "react";
import { AdaptiveBackground } from "./components/shared/AdaptiveBackground";
import HomePage from "./components/home/HomePage";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";

function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);
  const [poemHistory, setPoemHistory] = useState([]);

  // Load saved data on initial render
  React.useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("poit_poems_history") || "[]"
    );
    setPoemHistory(savedHistory);

    // Check if there's a daily session in progress
    const dailyWords = JSON.parse(
      localStorage.getItem("poit_daily_words") || "null"
    );
    const currentPoemData = JSON.parse(
      localStorage.getItem("poit_current_poem") || "null"
    );

    if (dailyWords) {
      setSelectedWords(dailyWords);

      if (currentPoemData) {
        setCurrentPoem(currentPoemData);
        // If there's a poem in progress, go straight to the echo mode
        setCurrentScreen("echo");
      } else {
        // If there are selected words but no poem, go to craft mode
        setCurrentScreen("craft");
      }
    }
  }, []);

  // Handler functions
  const handleStartDaily = () => {
    setCurrentScreen("pulse");
  };

  const handleViewHistory = () => {
    // For now, just log
    console.log("View history:", poemHistory);
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
      id: `poem-${Date.now()}`,
      title: "Today's Poem",
      author: "You",
      date: new Date().toLocaleDateString(),
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
    const updatedHistory = [
      {
        ...currentPoem,
        completedAt: new Date().toISOString(),
      },
      ...poemHistory,
    ].slice(0, 50); // Keep last 50 poems

    setPoemHistory(updatedHistory);
    localStorage.setItem("poit_poems_history", JSON.stringify(updatedHistory));

    // Update streak
    const streak = parseInt(localStorage.getItem("poit_streak") || "0");
    const newStreak = streak + 1;
    localStorage.setItem("poit_streak", newStreak.toString());

    // Update longest streak if needed
    const longestStreak = parseInt(
      localStorage.getItem("poit_longest_streak") || "0"
    );
    if (newStreak > longestStreak) {
      localStorage.setItem("poit_longest_streak", newStreak.toString());
    }

    // Clear current session
    localStorage.removeItem("poit_daily_words");
    localStorage.removeItem("poit_current_poem");
    setSelectedWords([]);
    setCurrentPoem(null);

    // Return to home
    setCurrentScreen("home");
  };

  // Callback to return to home screen
  const handleExitToHome = () => {
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
        <PulseMode
          onComplete={handlePulseComplete}
          onExitToHome={handleExitToHome}
        />
      )}

      {currentScreen === "craft" && (
        <CraftMode
          selectedWords={selectedWords}
          onComplete={handleCraftComplete}
          onExitToHome={handleExitToHome}
        />
      )}

      {currentScreen === "echo" && (
        <EchoMode
          poems={[currentPoem].filter(Boolean)}
          wordPool={selectedWords}
          onComplete={handleEchoComplete}
          onExitToHome={handleExitToHome}
        />
      )}
    </div>
  );
}

export default App;
