import React, { useState, useEffect, useCallback } from "react";
import { AdaptiveBackground } from "./components/shared/AdaptiveBackground";
import HomePage from "./components/home/HomePage";
import MenuView from "./components/home/MenuView";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import { getTestWordStrings, getTestPoems } from "./utils/testData/devTestData";
import CookieConsentBanner from "./components/shared/CookieConsentBanner";
import CookiePolicyPage from "./components/shared/CookiePolicyPage";

function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);
  const [poemHistory, setPoemHistory] = useState([]);
  const [isDevMode, setIsDevMode] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);

  // Save state
  const [lastSaved, setLastSaved] = useState(null);
  const [saveInterval, setSaveInterval] = useState(null);

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

    const currentPoemData = JSON.parse(
      localStorage.getItem("poit_current_poem") || "null"
    );

    const dailyWords = JSON.parse(
      localStorage.getItem("poit_daily_words") || "null"
    );

    // Check if pulse has been explicitly completed
    const pulseCompleted =
      localStorage.getItem("poit_pulse_completed") === "true";

    const pulseInProgress = JSON.parse(
      localStorage.getItem("poit_daily_words_in_progress") || "null"
    );

    const lastConstellationDate = localStorage.getItem(
      "poit_constellation_date"
    );
    const today = new Date().toDateString();

    if (lastConstellationDate !== today) {
      // Reset daily constellation count if it's a new day
      localStorage.setItem("poit_today_constellations", "0");
      localStorage.setItem("poit_constellation_date", today);
    }

    if (currentPoemData) {
      // User has reached Echo mode
      setCurrentPoem(currentPoemData);
      if (dailyWords) setSelectedWords(dailyWords);
      setCurrentScreen("echo");
    } else if (dailyWords && pulseCompleted) {
      // User has completed Pulse and explicitly continued to Craft
      setSelectedWords(dailyWords);
      setCurrentScreen("craft");
    } else if (pulseInProgress && pulseInProgress.length > 0) {
      // User started but didn't complete Pulse
      setCurrentScreen("pulse");
    }
    // Otherwise stay on home screen
  }, []);

  // Save data handler
  const saveData = useCallback(() => {
    let success = false;

    try {
      // Save based on current mode
      if (currentScreen === "pulse") {
        // Get the in-progress words from localStorage if they exist
        const inProgressWords = JSON.parse(
          localStorage.getItem("poit_daily_words_in_progress") || "[]"
        );

        if (inProgressWords.length > 0 || selectedWords.length > 0) {
          localStorage.setItem(
            "poit_daily_words",
            JSON.stringify(
              inProgressWords.length > 0 ? inProgressWords : selectedWords
            )
          );
          success = true;
        }
      } else if (currentScreen === "craft") {
        // Save selected words
        if (selectedWords.length > 0) {
          localStorage.setItem(
            "poit_daily_words",
            JSON.stringify(selectedWords)
          );
          success = true;
        }

        // Check if we have craft data to save
        const hasCraftData =
          localStorage.getItem("poit_craft_has_data") === "true";
        if (hasCraftData) {
          success = true;
        }

        // If we have a current poem, save it
        if (currentPoem) {
          localStorage.setItem(
            "poit_current_poem",
            JSON.stringify(currentPoem)
          );
          success = true;
        }
      } else if (currentScreen === "echo" && currentPoem) {
        localStorage.setItem("poit_current_poem", JSON.stringify(currentPoem));

        // Also save the network state
        const connectingWords = JSON.parse(
          localStorage.getItem("poit_connecting_words") || "{}"
        );
        const navigationHistory = JSON.parse(
          localStorage.getItem("poit_navigation_history") || "[]"
        );

        // Save a more complete state
        localStorage.setItem(
          "poit_echo_state",
          JSON.stringify({
            currentPoemId: currentPoem.id,
            navigationHistory,
            connectingWords,
            lastSaved: new Date().toISOString(),
          })
        );

        success = true;
      }

      if (success) {
        const now = new Date();
        setLastSaved(now.toISOString());
      }

      return success;
    } catch (error) {
      console.error("Error saving data:", error);
      return false;
    }
  }, [currentScreen, selectedWords, currentPoem]);

  // Set up auto-save interval when in creative modes
  useEffect(() => {
    // Clear any existing interval
    if (saveInterval) {
      clearInterval(saveInterval);
      setSaveInterval(null);
    }

    // Only set up auto-save for creative modes
    if (["pulse", "craft", "echo"].includes(currentScreen)) {
      const interval = setInterval(saveData, 60000); // Save every 60 seconds
      setSaveInterval(interval);
    }

    return () => {
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    };
  }, [currentScreen, saveData]);

  // Handler functions
  const handleStartDaily = () => {
    // Check for active sessions in order of progression
    const currentPoemData = JSON.parse(
      localStorage.getItem("poit_current_poem") || "null"
    );

    const dailyWords = JSON.parse(
      localStorage.getItem("poit_daily_words") || "null"
    );

    // Check if pulse has been explicitly completed
    const pulseCompleted =
      localStorage.getItem("poit_pulse_completed") === "true";

    const pulseInProgress = JSON.parse(
      localStorage.getItem("poit_daily_words_in_progress") || "null"
    );

    if (currentPoemData) {
      // User has reached Echo mode
      setCurrentPoem(currentPoemData);
      if (dailyWords) setSelectedWords(dailyWords);

      // Also load echo state
      const echoState = JSON.parse(
        localStorage.getItem("poit_echo_state") || "null"
      );
      if (echoState) {
        // This data will be available to EchoMode when it loads
        console.log("Loaded Echo state:", echoState);
      }

      setCurrentScreen("echo");
    } else if (dailyWords && pulseCompleted) {
      // User has explicitly completed Pulse and should be in Craft
      setSelectedWords(dailyWords);
      setCurrentScreen("craft");
    } else if (pulseInProgress && pulseInProgress.length > 0) {
      // User started but didn't complete Pulse
      setCurrentScreen("pulse");
    } else {
      // No active session, start fresh at Pulse
      setCurrentScreen("pulse");
    }
  };

  const handleViewHistory = () => {
    // For now, just log
    console.log("View history:", poemHistory);
  };

  const handlePulseComplete = (words) => {
    setSelectedWords(words);

    // Save to localStorage
    localStorage.setItem("poit_daily_words", JSON.stringify(words));

    // Set flag to indicate pulse was explicitly completed
    localStorage.setItem("poit_pulse_completed", "true");

    setLastSaved(new Date().toISOString());

    setCurrentScreen("craft");
  };

  const updateStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStreakDateStr = localStorage.getItem("poit_last_streak_date");
    let streak = parseInt(localStorage.getItem("poit_streak") || "0");

    if (lastStreakDateStr) {
      const lastStreakDate = new Date(lastStreakDateStr);
      lastStreakDate.setHours(0, 0, 0, 0);

      const diffTime = today - lastStreakDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        streak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        streak = 1;
      } else if (diffDays === 0) {
        // Already updated today
        return;
      }
    } else {
      // First time ever
      streak = 1;
    }

    // Update streak in localStorage
    localStorage.setItem("poit_streak", streak.toString());
    localStorage.setItem("poit_last_streak_date", today.toISOString());

    // Update longest streak if needed
    const longestStreak = parseInt(
      localStorage.getItem("poit_longest_streak") || "0"
    );
    if (streak > longestStreak) {
      localStorage.setItem("poit_longest_streak", streak.toString());
    }
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

    // Update streak when transitioning to Echo mode
    updateStreak();

    setLastSaved(new Date().toISOString());
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

    // Clear current session
    localStorage.removeItem("poit_daily_words");
    localStorage.removeItem("poit_current_poem");
    localStorage.removeItem("poit_pulse_completed");
    localStorage.removeItem("poit_navigation_history");
    localStorage.removeItem("poit_echo_state");

    // Don't clear connecting_words as they represent the overall constellation

    setSelectedWords([]);
    setCurrentPoem(null);

    // Return to home
    setCurrentScreen("home");
  };

  // Callback to return to home screen
  const handleExitToHome = (target = "home") => {
    // Save progress before exiting
    saveData();
    setCurrentScreen(target);
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

  if (showCookiePolicy) {
    return <CookiePolicyPage onBack={() => setShowCookiePolicy(false)} />;
  }

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

      {currentScreen === "menu" && (
        <MenuView
          onClose={() => setCurrentScreen("home")}
          onStartDaily={handleStartDaily}
          onViewHistory={handleViewHistory}
        />
      )}

      {currentScreen === "pulse" && (
        <PulseMode
          onComplete={handlePulseComplete}
          onExitToHome={handleExitToHome}
          onSave={saveData}
          lastSaved={lastSaved}
        />
      )}

      {currentScreen === "craft" && (
        <CraftMode
          selectedWords={selectedWords}
          onComplete={handleCraftComplete}
          onExitToHome={handleExitToHome}
          onSave={saveData}
          lastSaved={lastSaved}
        />
      )}

      {currentScreen === "echo" && (
        <EchoMode
          poems={
            isDevMode
              ? currentPoem
                ? [
                    currentPoem,
                    ...poemHistory.filter((p) => p.id !== currentPoem.id),
                  ]
                : poemHistory
              : [currentPoem].filter(Boolean)
          }
          wordPool={selectedWords}
          onComplete={handleEchoComplete}
          onExitToHome={handleExitToHome}
          onSave={saveData}
          lastSaved={lastSaved}
        />
      )}

      {/* Cookie Consent Banner */}
      <CookieConsentBanner onViewPolicy={() => setShowCookiePolicy(true)} />
    </div>
  );
}

export default App;
