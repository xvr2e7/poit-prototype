import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordPool from "./components/WordPool";
import WordInteraction from "./components/WordInteraction";
import GrowingWordSelector from "./components/GrowingWordSelector";
import Navigation from "../../shared/Navigation";
import { CompletionView } from "./components/CompletionView";
import SelectedWordsModal from "./components/SelectedWordsModal";

const PulseMode = ({ onComplete, onExitToHome }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [selectorPosition, setSelectorPosition] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [availableWords, setAvailableWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSelectedWords, setShowSelectedWords] = useState(false);
  const wordPositionsRef = useRef(new Map());

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === "w" && !showCompletion) {
        setShowSelectedWords(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showCompletion]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        // Check for dev mode
        const urlParams = new URLSearchParams(window.location.search);
        const devMode = urlParams.get("dev");

        if (devMode === "true") {
          // Import and use test words
          const { getTestWords } = await import(
            "../../../utils/testData/devTestData"
          );
          setAvailableWords(getTestWords());
          setIsLoading(false);
          return;
        }

        // Normal API fetch for production
        // Get user's timezone
        let timezone;
        try {
          const timeZoneDetector = Intl.DateTimeFormat();
          const resolvedOptions = timeZoneDetector.resolvedOptions();
          timezone = resolvedOptions.timeZone;
        } catch (error) {
          console.error("Timezone detection error:", error);
          timezone = "UTC";
        }

        const response = await fetch("http://localhost:5001/api/words", {
          headers: {
            "X-Timezone": timezone,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAvailableWords(data.words);
      } catch (error) {
        console.error("Error in fetchWords:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, []);

  const handleWordPositionUpdate = (wordId, rect) => {
    wordPositionsRef.current.set(wordId, rect);
  };

  const handleWordSelect = (wordId) => {
    if (!selectedWords.includes(wordId) && selectedWords.length < 10) {
      const newSelectedWords = [...selectedWords, wordId];
      setSelectedWords(newSelectedWords);

      if (newSelectedWords.length >= 10) {
        handlePulseComplete();
      }
    }
  };

  const getSelectedWordTexts = () => {
    return selectedWords.map((id) => {
      const word = availableWords.find((w) => w.text === id || w._id === id);
      return word ? word.text : id;
    });
  };

  const handleRemoveWord = (wordToRemove) => {
    setSelectedWords((prev) =>
      prev.filter((word) => {
        // Compare either directly or by finding the word object
        const wordText =
          typeof word === "string"
            ? word
            : availableWords.find((w) => w._id === word)?.text;
        return wordText !== wordToRemove;
      })
    );
  };

  const handleSelectorMove = (position) => {
    if (!showCompletion) {
      setSelectorPosition(position);
    }
  };

  const handleSelectorStart = () => {
    if (!showCompletion) {
      setIsActive(true);
    }
  };

  const handlePulseComplete = () => {
    setShowCompletion(true);
    setSelectorPosition(null);
  };

  const handleSaveProgress = () => {
    // Save current state to localStorage
    if (selectedWords.length > 0) {
      localStorage.setItem(
        "poit_daily_words",
        JSON.stringify(getSelectedWordTexts())
      );
      // Show visual feedback that could be implemented later
      console.log("Progress saved", selectedWords);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="text-[#2C8C7C]">Loading words...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <Navigation
        currentMode="pulse"
        onSave={handleSaveProgress}
        onExit={() => {
          handleSaveProgress();
        }}
        onExitToHome={onExitToHome}
      />

      {/* Main content */}
      <div className="absolute inset-0 z-10">
        <WordInteraction
          selectorPosition={selectorPosition}
          wordPositions={wordPositionsRef.current}
          onWordSelect={handleWordSelect}
        >
          <WordPool
            words={availableWords}
            selectedWords={selectedWords}
            onPositionUpdate={handleWordPositionUpdate}
          />
        </WordInteraction>

        {!showCompletion && (
          <GrowingWordSelector
            selectedWords={selectedWords}
            minWords={5}
            maxWords={10}
            onMove={handleSelectorMove}
            onComplete={() => setShowCompletion(true)}
            onStart={() => setIsActive(true)}
            active={isActive}
          />
        )}

        <AnimatePresence>
          {showCompletion && (
            <CompletionView
              onSave={() => {
                setIsSaved(true);
                setTimeout(() => onComplete(getSelectedWordTexts()), 1000);
              }}
              saved={isSaved}
              selectedWords={getSelectedWordTexts()}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Selected Words Modal (W key) */}
      {!showCompletion && (
        <SelectedWordsModal
          isOpen={showSelectedWords}
          onClose={() => setShowSelectedWords(false)}
          selectedWords={getSelectedWordTexts()}
          onRemoveWord={handleRemoveWord}
          minWords={5}
          maxWords={10}
        />
      )}
    </div>
  );
};

export default PulseMode;
