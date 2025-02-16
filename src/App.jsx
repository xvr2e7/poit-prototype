import React, { useState } from "react";
import Navigation from "./components/shared/Navigation";
import Login from "./components/auth/Login";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import Playground from "./components/playground/PlayMode";
import { AdaptiveBackground } from "./components/shared/AdaptiveBackground";
import { TEST_WORDS } from "./utils/testData/craftTestData";
import { TEST_POEMS, isHighlightedWord } from "./utils/testData/echoTestData";

function App() {
  const [currentMode, setCurrentMode] = useState("pulse");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lockedModes, setLockedModes] = useState({ craft: true, echo: true });
  const [playgroundUnlocked, setPlaygroundUnlocked] = useState(false);
  const [inPlayground, setInPlayground] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);
  const [testPoems, setTestPoems] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authSource, setAuthSource] = useState(null);

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
    setInPlayground(true);
  };

  const exitPlayground = () => {
    setInPlayground(false);
    setCurrentMode("pulse");
    setSelectedWords([]);
  };

  // Handle login request from playground
  const handleLoginRequest = (source) => {
    setAuthSource(source);
    setShowAuthModal(true);
  };

  // Handle completion of Pulse mode
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
    const processedPoem = {
      id: `poem-${Date.now()}`,
      title: "Untitled Poem",
      author: "Anonymous",
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

  if (!isAuthenticated && !inPlayground) {
    return (
      <div className="w-full min-h-screen relative">
        <AdaptiveBackground />
        <Login
          onLogin={() => setIsAuthenticated(true)}
          enterPlayground={enterPlayground}
          onTestModeSelect={handleTestModeSelect}
          showAuthModal={showAuthModal}
          onCloseAuthModal={() => setShowAuthModal(false)}
          authSource={authSource}
        />
      </div>
    );
  }

  if (inPlayground) {
    return (
      <div className="w-full min-h-screen relative">
        <AdaptiveBackground />
        <Playground
          onExit={exitPlayground}
          onLoginRequest={handleLoginRequest}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdaptiveBackground />

      {currentMode !== "pulse" && (
        <Navigation
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          lockedModes={lockedModes}
          inPlayground={inPlayground}
        />
      )}

      <main className="flex-1 w-full relative">
        {currentMode === "pulse" && (
          <PulseMode onComplete={handlePulseComplete} />
        )}

        {currentMode === "craft" && (
          <CraftMode
            onComplete={handleCraftComplete}
            selectedWords={selectedWords}
            enabled={!lockedModes.craft}
          />
        )}

        {currentMode === "echo" && (
          <EchoMode
            onComplete={unlockPlayground}
            playgroundUnlocked={playgroundUnlocked}
            enterPlayground={enterPlayground}
            enabled={!lockedModes.echo}
            poems={testPoems.length > 0 ? testPoems : [currentPoem]}
            wordPool={testPoems.length > 0 ? TEST_WORDS : selectedWords}
          />
        )}
      </main>
    </div>
  );
}

export default App;
