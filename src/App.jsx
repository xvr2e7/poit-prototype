import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { AdaptiveBackground } from "./components/shared/AdaptiveBackground";
import HomePage from "./components/home/HomePage";
import MenuView from "./components/home/MenuView";
import PulseMode from "./components/core/pulse/PulseMode";
import CraftMode from "./components/core/craft/CraftMode";
import EchoMode from "./components/core/echo/EchoMode";
import CookieConsentBanner from "./components/shared/CookieConsentBanner";
import CookiePolicyPage from "./components/shared/CookiePolicyPage";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import SharedPoemPage from "./components/shared/SharedPoemPage";
import PoemletView from "./components/home/PoemletView";
import IconSheet from "./components/shared/IconSheet";
import { formatSeedPoems } from "./utils/poemFormatter";
import { initDeviceIdentity, authFetch } from "./utils/deviceIdentity";
import { API_URL } from "./utils/api";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Core state
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentPoem, setCurrentPoem] = useState(null);
  const [poemHistory, setPoemHistory] = useState([]);

  // Seed poems for Echo mode
  const [seedPoems, setSeedPoems] = useState([]);

  // Community poems for Echo mode
  const [communityPoems, setCommunityPoems] = useState([]);

  // Save state
  const [lastSaved, setLastSaved] = useState(null);
  const [saveInterval, setSaveInterval] = useState(null);

  // Derive current screen from pathname for save logic
  const currentScreen = location.pathname.replace("/", "") || "home";

  // Load saved data on initial render and redirect to correct screen
  useEffect(() => {
    try {
      const legacyPoems = localStorage.getItem("poit_poems");
      const canonicalPoems = localStorage.getItem("poit_poems_history");
      if (legacyPoems && !canonicalPoems) {
        localStorage.setItem("poit_poems_history", legacyPoems);
      }

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
        localStorage.setItem("poit_today_constellations", "0");
        localStorage.setItem("poit_constellation_date", today);
      }

      // Only auto-redirect if we're on the home page
      if (location.pathname === "/") {
        if (currentPoemData) {
          setCurrentPoem(currentPoemData);
          if (dailyWords) setSelectedWords(dailyWords);
          navigate("/echo", { replace: true });
        } else if (dailyWords && pulseCompleted) {
          setSelectedWords(dailyWords);
          navigate("/craft", { replace: true });
        } else if (pulseInProgress && pulseInProgress.length > 0) {
          navigate("/pulse", { replace: true });
        }
      } else {
        // Restore state for non-home routes
        if (currentPoemData) setCurrentPoem(currentPoemData);
        if (dailyWords) setSelectedWords(dailyWords);
      }
    } catch (error) {
      console.error("Failed to load saved state:", error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch seed poems for Echo mode
  useEffect(() => {
    const fetchSeedPoems = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch(`${API_URL}/seed-poems?timezone=${tz}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.poems?.length) {
          const wordPool = selectedWords.length
            ? selectedWords
            : JSON.parse(localStorage.getItem("poit_daily_words") || "[]");
          if (wordPool.length > 0) {
            setSeedPoems(formatSeedPoems(data.poems, wordPool));
          }
        }
      } catch (err) {
        console.error("Failed to fetch seed poems:", err);
      }
    };
    fetchSeedPoems();
  }, [selectedWords]);

  // Initialise device identity on mount (fire-and-forget)
  useEffect(() => {
    initDeviceIdentity().catch(() => {});
  }, []);

  // Fetch community poems for Echo mode
  useEffect(() => {
    const fetchCommunityPoems = async () => {
      try {
        const dateKey = new Date().toISOString().slice(0, 10);
        const res = await authFetch(
          `${API_URL}/poems/community?date_key=${dateKey}&limit=30`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.poems?.length) {
          setCommunityPoems(
            data.poems.map((p) => ({
              ...p,
              source: "community",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch community poems:", err);
      }
    };
    fetchCommunityPoems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save data handler
  const saveData = useCallback(() => {
    let success = false;

    try {
      if (currentScreen === "pulse") {
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
        if (selectedWords.length > 0) {
          localStorage.setItem(
            "poit_daily_words",
            JSON.stringify(selectedWords)
          );
          success = true;
        }

        const hasCraftData =
          localStorage.getItem("poit_craft_has_data") === "true";
        if (hasCraftData) {
          success = true;
        }

        if (currentPoem) {
          localStorage.setItem(
            "poit_current_poem",
            JSON.stringify(currentPoem)
          );
          success = true;
        }
      } else if (currentScreen === "echo" && currentPoem) {
        localStorage.setItem("poit_current_poem", JSON.stringify(currentPoem));

        const connectingWords = JSON.parse(
          localStorage.getItem("poit_connecting_words") || "{}"
        );
        const navigationHistory = JSON.parse(
          localStorage.getItem("poit_navigation_history") || "[]"
        );

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
        setLastSaved(new Date().toISOString());
      }

      return success;
    } catch (error) {
      console.error("Error saving data:", error);
      return false;
    }
  }, [currentScreen, selectedWords, currentPoem]);

  // Set up auto-save interval when in creative modes
  useEffect(() => {
    if (saveInterval) {
      clearInterval(saveInterval);
      setSaveInterval(null);
    }

    if (["pulse", "craft", "echo"].includes(currentScreen)) {
      const interval = setInterval(saveData, 60000);
      setSaveInterval(interval);
    }

    return () => {
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    };
  }, [currentScreen, saveData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler functions
  const handleStartDaily = () => {
    const currentPoemData = JSON.parse(
      localStorage.getItem("poit_current_poem") || "null"
    );

    const dailyWords = JSON.parse(
      localStorage.getItem("poit_daily_words") || "null"
    );

    const pulseCompleted =
      localStorage.getItem("poit_pulse_completed") === "true";

    const pulseInProgress = JSON.parse(
      localStorage.getItem("poit_daily_words_in_progress") || "null"
    );

    if (currentPoemData) {
      setCurrentPoem(currentPoemData);
      if (dailyWords) setSelectedWords(dailyWords);
      navigate("/echo");
    } else if (dailyWords && pulseCompleted) {
      setSelectedWords(dailyWords);
      navigate("/craft");
    } else if (pulseInProgress && pulseInProgress.length > 0) {
      navigate("/pulse");
    } else {
      navigate("/pulse");
    }
  };

  const handleViewHistory = () => {
    navigate("/poemlet");
  };

  const handlePulseComplete = (words) => {
    setSelectedWords(words);
    localStorage.setItem("poit_daily_words", JSON.stringify(words));
    localStorage.setItem("poit_pulse_completed", "true");
    setLastSaved(new Date().toISOString());
    navigate("/craft");
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
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      } else if (diffDays === 0) {
        return;
      }
    } else {
      streak = 1;
    }

    localStorage.setItem("poit_streak", streak.toString());
    localStorage.setItem("poit_last_streak_date", today.toISOString());

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
    localStorage.setItem("poit_current_poem", JSON.stringify(processedPoem));
    updateStreak();
    setLastSaved(new Date().toISOString());
    navigate("/echo");

    // Save poem to server in background (non-blocking)
    authFetch(`${API_URL}/poems`, {
      method: "POST",
      body: {
        title: processedPoem.title,
        components: processedPoem.components,
        selectedWords: selectedWords.map((w) =>
          typeof w === "string" ? w : w.text
        ),
        dateKey: new Date().toISOString().slice(0, 10),
        isPublic: true,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) {
          // Store server poem ID for sharing
          const updated = { ...processedPoem, serverId: data.id };
          setCurrentPoem(updated);
          localStorage.setItem("poit_current_poem", JSON.stringify(updated));
        }
      })
      .catch((err) => console.error("Failed to save poem to server:", err));
  };

  const handleEchoComplete = () => {
    const updatedHistory = [
      {
        ...currentPoem,
        completedAt: new Date().toISOString(),
      },
      ...poemHistory,
    ].slice(0, 50);

    setPoemHistory(updatedHistory);
    localStorage.setItem("poit_poems_history", JSON.stringify(updatedHistory));

    localStorage.removeItem("poit_daily_words");
    localStorage.removeItem("poit_current_poem");
    localStorage.removeItem("poit_pulse_completed");
    localStorage.removeItem("poit_navigation_history");
    localStorage.removeItem("poit_echo_state");

    setSelectedWords([]);
    setCurrentPoem(null);
    navigate("/");
  };

  const handleExitToHome = () => {
    saveData();
    navigate("/");
  };

  // Route guards
  const CraftGuard = () => {
    if (selectedWords.length === 0) {
      const dailyWords = JSON.parse(
        localStorage.getItem("poit_daily_words") || "null"
      );
      const pulseCompleted =
        localStorage.getItem("poit_pulse_completed") === "true";
      if (dailyWords && pulseCompleted) {
        setSelectedWords(dailyWords);
        return null; // Will re-render with words
      }
      return <Navigate to="/pulse" replace />;
    }
    return null;
  };

  const EchoGuard = () => {
    if (!currentPoem) {
      const poemData = JSON.parse(
        localStorage.getItem("poit_current_poem") || "null"
      );
      if (poemData) {
        setCurrentPoem(poemData);
        const dailyWords = JSON.parse(
          localStorage.getItem("poit_daily_words") || "null"
        );
        if (dailyWords) setSelectedWords(dailyWords);
        return null;
      }
      return <Navigate to="/pulse" replace />;
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <AdaptiveBackground />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onStartDaily={handleStartDaily}
              onViewHistory={handleViewHistory}
            />
          }
        />

        <Route
          path="/menu"
          element={
            <MenuView
              onClose={() => navigate("/")}
              onStartDaily={handleStartDaily}
              onViewHistory={handleViewHistory}
            />
          }
        />

        <Route
          path="/pulse"
          element={
            <ErrorBoundary fallbackMessage="Something went wrong in Pulse mode." onGoHome={() => navigate("/")}>
              <PulseMode
                onComplete={handlePulseComplete}
                onExitToHome={handleExitToHome}
                onSave={saveData}
                lastSaved={lastSaved}
              />
            </ErrorBoundary>
          }
        />

        <Route
          path="/craft"
          element={
            <>
              <CraftGuard />
              <ErrorBoundary fallbackMessage="Something went wrong in Craft mode." onGoHome={() => navigate("/")}>
                <CraftMode
                  selectedWords={selectedWords}
                  onComplete={handleCraftComplete}
                  onExitToHome={handleExitToHome}
                  onSave={saveData}
                  lastSaved={lastSaved}
                />
              </ErrorBoundary>
            </>
          }
        />

        <Route
          path="/echo"
          element={
            <>
              <EchoGuard />
              <ErrorBoundary fallbackMessage="Something went wrong in Echo mode." onGoHome={() => navigate("/")}>
                <EchoMode
                  poems={
                    currentPoem
                      ? [
                          currentPoem,
                          ...poemHistory.filter((p) => p.id !== currentPoem.id),
                          ...communityPoems.filter(
                            (p) => p.id !== currentPoem.id && p.id !== currentPoem.serverId
                          ),
                          ...seedPoems,
                        ]
                      : [...poemHistory, ...communityPoems, ...seedPoems]
                  }
                  wordPool={selectedWords}
                  onComplete={handleEchoComplete}
                  onExitToHome={handleExitToHome}
                  onSave={saveData}
                  lastSaved={lastSaved}
                />
              </ErrorBoundary>
            </>
          }
        />

        <Route path="/cookie-policy" element={<CookiePolicyPage onBack={() => navigate(-1)} />} />

        {/* Poemlet — the poet's own chapbook */}
        <Route path="/poemlet" element={<PoemletView />} />

        {/* Shareable poem page */}
        <Route path="/poem/:id" element={<SharedPoemPage />} />

        {/* Dev-only proof sheet for the icon set */}
        {import.meta.env.DEV && <Route path="/dev/icons" element={<IconSheet />} />}

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CookieConsentBanner onViewPolicy={() => navigate("/cookie-policy")} />
    </div>
  );
}

export default App;
