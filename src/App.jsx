import React, { useState } from "react";
import Navigation from "./components/shared/Navigation";
import Login from "./components/auth/Login";
import DashboardView from "./components/dashboard/DashboardView";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import Playground from "./components/playground/PlayMode";
import { AdaptiveBackground } from "./components/shared/AdaptiveBackground";
import { TEST_WORDS } from "./utils/testData/craftTestData";
import { TEST_POEMS, isHighlightedWord } from "./utils/testData/echoTestData";

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentMode, setCurrentMode] = useState("dashboard");

  // Test mode states
  const [testPoems, setTestPoems] = useState([]);

  // Mock user data for dashboard
  const [userData, setUserData] = useState({
    name: "John Doe",
    profileImage: "/api/placeholder/32/32",
    poems: [
      {
        id: 1,
        title: "Quantum Dreams",
        preview: "In the space between thoughts...",
        date: "2025-02-15",
        connections: 15,
      },
      {
        id: 2,
        title: "Morning Static",
        preview: "Pixels dance in steam...",
        date: "2025-02-14",
        connections: 8,
      },
    ],
    featured: [
      {
        id: 1,
        title: "Quantum Dreams",
        preview: "In the space between thoughts...",
        date: "2025-02-15",
        connections: 15,
        isPinned: true,
      },
    ],
    activities: {
      lastWeek: 5,
      totalPoems: 12,
      totalConnections: 45,
    },
  });

  // POiT mode states
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);
  const [lockedModes, setLockedModes] = useState({ craft: true, echo: true });
  const [playgroundUnlocked, setPlaygroundUnlocked] = useState(false);
  const [inPlayground, setInPlayground] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authSource, setAuthSource] = useState(null);

  // Auth handlers
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentMode("dashboard");
  };

  const handleLoginRequest = (source) => {
    setAuthSource(source);
    setShowAuthModal(true);
  };

  // Navigation handlers
  const handleStartPoiT = () => {
    setCurrentMode("pulse");
  };

  const handleOpenPoemlet = () => {
    console.log("Opening Poemlet...");
  };

  const enterPlayground = () => {
    setInPlayground(true);
  };

  const exitPlayground = () => {
    setInPlayground(false);
    setCurrentMode("dashboard");
    setSelectedWords([]);
  };

  // Mode completion handlers
  const handlePulseComplete = (words) => {
    setSelectedWords(words);
    setLockedModes((prev) => ({ ...prev, craft: false }));
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
    setLockedModes((prev) => ({ ...prev, echo: false }));
    setCurrentMode("echo");
  };

  const handleTestModeSelect = (mode) => {
    setIsAuthenticated(true);
    if (mode === "craft") {
      const randomWords = [...TEST_WORDS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 15)
        .map((word, index) => ({
          id: `word-${index}`,
          text: word.text,
          type: "word",
          position: {
            x: Math.random() * 600,
            y: Math.random() * 400,
          },
        }));
      setSelectedWords(randomWords);
      setLockedModes((prev) => ({ ...prev, craft: false }));
    } else if (mode === "echo") {
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
      setLockedModes((prev) => ({ ...prev, echo: false }));
    }
    setCurrentMode(mode);
  };

  // Render logic
  if (!isAuthenticated && !inPlayground) {
    return (
      <div className="w-full min-h-screen relative">
        <AdaptiveBackground />
        <Login
          onLogin={handleLogin}
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

      {currentMode !== "pulse" && currentMode !== "dashboard" && (
        <Navigation
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          lockedModes={lockedModes}
          inPlayground={inPlayground}
        />
      )}

      <main className="flex-1 w-full relative">
        {currentMode === "dashboard" && (
          <DashboardView
            userData={userData}
            onStartPoiT={handleStartPoiT}
            onOpenPoemlet={handleOpenPoemlet}
          />
        )}
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
            onComplete={() => setPlaygroundUnlocked(true)}
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
