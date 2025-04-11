import React, { useState, useEffect } from "react";
import { AdaptiveBackground } from "./components/shared/AdaptiveBackground";
import HomePage from "./components/home/HomePage";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import { getTestWordStrings, getTestPoems } from "./utils/testData/devTestData";

function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);
  const [poemHistory, setPoemHistory] = useState([]);
  const [isDevMode, setIsDevMode] = useState(false);

  // Load saved data on initial render
  useEffect(() => {
    // Check for dev mode activation via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const devMode = urlParams.get("dev");

    if (devMode === "true") {
      try {
        // Load test data
        const testWords = getTestWordStrings();
        const testPoems = getTestPoems();

        setSelectedWords(testWords);
        setPoemHistory(testPoems);
        setIsDevMode(true);
        console.log(`- Loaded ${testWords.length} test words`);
        console.log(`- Loaded ${testPoems.length} test poems`);
        return;
      } catch (error) {
        console.error("Failed to load test data:", error);
        // Fall back to normal mode if test data fails
      }
    }

    // Normal production data loading
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
      title: poemData.title || "Today's Poem",
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

  // Function to handle entering dev mode echo
  const enterDevModeEcho = () => {
    setCurrentScreen("echo");
  };

  // Check if we should show dev mode buttons
  const showDevControls =
    process.env.NODE_ENV === "development" && currentScreen === "home";

  // Toggle dev mode on/off
  const toggleDevMode = () => {
    const url = new URL(window.location);

    if (isDevMode) {
      // Turn off dev mode
      url.searchParams.delete("dev");
      window.history.pushState({}, "", url);
      window.location.reload();
    } else {
      // Turn on dev mode
      url.searchParams.set("dev", "true");
      window.history.pushState({}, "", url);
      window.location.reload();
    }
  };

  // Render based on current screen
  return (
    <div className="min-h-screen">
      <AdaptiveBackground />

      {currentScreen === "home" && (
        <>
          <HomePage
            onStartDaily={handleStartDaily}
            onViewHistory={handleViewHistory}
          />

          {/* Dev mode controls */}
          {showDevControls && (
            <div className="fixed bottom-4 right-4 flex flex-col gap-2">
              <button
                onClick={toggleDevMode}
                className={`px-2 py-1 ${
                  isDevMode ? "bg-[#2C8C7C]" : "bg-gray-600"
                } text-white text-xs rounded-lg shadow-lg`}
              >
                Dev Mode: {isDevMode ? "ON" : "OFF"}
              </button>

              {isDevMode && (
                <>
                  <button
                    onClick={() => setCurrentScreen("pulse")}
                    className="px-2 py-1 bg-gray-400 text-white text-xs rounded-lg shadow-lg"
                  >
                    Dev: Pulse Mode
                  </button>
                  <button
                    onClick={enterDevModeEcho}
                    className="px-2 py-1 bg-gray-400 text-white text-xs rounded-lg shadow-lg"
                  >
                    Dev: Echo Mode
                  </button>
                </>
              )}
            </div>
          )}
        </>
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
          poems={isDevMode ? poemHistory : [currentPoem].filter(Boolean)}
          wordPool={selectedWords}
          onComplete={handleEchoComplete}
          onExitToHome={handleExitToHome}
        />
      )}
    </div>
  );
}

export default App;
