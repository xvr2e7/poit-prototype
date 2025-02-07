import React, { useState } from "react";
import Navigation from "./components/shared/Navigation";
import Login from "./components/auth/Login";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import Playground from "./components/playground/PlayMode";
import { TEST_WORDS } from "./utils/testData/craftTestData";
import { TEST_POEMS, isHighlightedWord } from "./utils/testData/echoTestData";
import { AdaptiveBackground } from "./components/shared/AdaptiveBackground";

function App() {
  const [currentMode, setCurrentMode] = useState("pulse");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lockedModes, setLockedModes] = useState({ craft: true, echo: true });
  const [playgroundUnlocked, setPlaygroundUnlocked] = useState(false);
  const [inPlayground, setInPlayground] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);
  const [testPoems, setTestPoems] = useState([]);

  // Process words from test data to include type and positioning
  const processTestWords = (words) => {
    return words.map((word, index) => ({
      ...word,
      type: "word", // All test words are regular words, not punctuation
      position: {
        x: Math.random() * 600,
        y: Math.random() * 400,
      },
    }));
  };

  const handleTestModeSelect = (mode) => {
    setIsAuthenticated(true);
    if (mode === "craft") {
      // For testing Craft Mode, select some random words from TEST_WORDS
      const randomWords = processTestWords(
        [...TEST_WORDS].sort(() => Math.random() - 0.5).slice(0, 15)
      );
      setSelectedWords(randomWords);
      unlockMode("craft");
    } else if (mode === "echo") {
      // For testing Echo Mode, process test poems
      const processedPoems = TEST_POEMS.map((poem) => ({
        ...poem,
        // Update highlighted word count based on TEST_WORDS
        metadata: {
          ...poem.metadata,
          highlightedWordCount: poem.components.filter((component) =>
            isHighlightedWord(component, TEST_WORDS)
          ).length,
        },
      }));
      setTestPoems(processedPoems);
      unlockMode("echo");
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

  // Handle completion of Pulse mode - words should be processed into components
  const handlePulseComplete = (words = []) => {
    const processedWords = words.map((word) => ({
      text: word,
      type: "word",
      id: `word-${Math.random().toString(36).substr(2, 9)}`,
    }));
    setSelectedWords(processedWords);
    unlockMode("craft");
    setCurrentMode("craft");
  };

  const handleCraftComplete = (poemData) => {
    // Create a properly structured poem object for Echo mode
    const processedPoem = {
      id: `poem-${Date.now()}`,
      title: "Untitled Poem", // Add a title input in Craft mode later
      author: "Anonymous", // Get this from user state later
      date: new Date().toISOString().split("T")[0],
      components: poemData.components,
      metadata: {
        ...poemData.metadata,
        highlightedWordCount: poemData.words.length,
      },
    };

    setCurrentPoem(processedPoem);
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

      case "echo": {
        // Use either test poems or real poems
        const poems = testPoems.length > 0 ? testPoems : [currentPoem];

        // Determine word pool for highlighting
        const wordPool = testPoems.length > 0 ? TEST_WORDS : selectedWords;

        return (
          <EchoMode
            onComplete={unlockPlayground}
            playgroundUnlocked={playgroundUnlocked}
            enterPlayground={enterPlayground}
            enabled={!lockedModes.echo}
            poems={poems}
            wordPool={wordPool}
          />
        );
      }

      default:
        return <PulseMode onComplete={handlePulseComplete} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen relative">
        <AdaptiveBackground />
        <Login
          onLogin={() => setIsAuthenticated(true)}
          enterPlayground={enterPlayground}
          onTestModeSelect={handleTestModeSelect}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background that adapts to theme */}
      <AdaptiveBackground />

      {/* Navigation with theme-aware styling */}
      {currentMode !== "pulse" && (
        <Navigation
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          lockedModes={lockedModes}
          inPlayground={inPlayground}
        />
      )}

      {/* Main content */}
      <main className="flex-1 w-full relative">{renderMode()}</main>
    </div>
  );
}

export default App;
