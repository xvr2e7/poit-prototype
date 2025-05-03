import React, { useState, useRef, useEffect } from "react";
import WordPool from "./components/WordPool";
import WordInteraction from "./components/WordInteraction";
import GrowingWordSelector from "./components/GrowingWordSelector";
import Navigation from "../../shared/Navigation";
import SelectedWordsModal from "./components/SelectedWordsModal";

const PulseMode = ({ onComplete, onExitToHome, onSave, lastSaved }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [selectorPosition, setSelectorPosition] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [showSelectedWords, setShowSelectedWords] = useState(false);
  const [availableWords, setAvailableWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const wordPositionsRef = useRef(new Map());

  // Load saved words from localStorage on component mount
  useEffect(() => {
    const loadSavedWords = () => {
      const savedWords = localStorage.getItem("poit_daily_words_in_progress");
      if (savedWords) {
        try {
          const parsedWords = JSON.parse(savedWords);
          if (Array.isArray(parsedWords) && parsedWords.length > 0) {
            console.log("Loaded saved words:", parsedWords);
            setSelectedWords(parsedWords);
          }
        } catch (error) {
          console.error("Error parsing saved words:", error);
          // If parsing fails, clear the corrupted data
          localStorage.removeItem("poit_daily_words_in_progress");
        }
      }
    };

    // Load saved words after availableWords are loaded
    if (!isLoading) {
      loadSavedWords();
    }
  }, [isLoading]);

  // Save selected words to localStorage whenever they change
  useEffect(() => {
    if (selectedWords.length > 0) {
      localStorage.setItem(
        "poit_daily_words_in_progress",
        JSON.stringify(selectedWords)
      );
      console.log("Saved words to localStorage:", selectedWords);
    }
  }, [selectedWords]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === "w") {
        setShowSelectedWords(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

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
    if (!selectedWords.includes(wordId) && selectedWords.length < 20) {
      const newSelectedWords = [...selectedWords, wordId];
      setSelectedWords(newSelectedWords);

      if (newSelectedWords.length >= 20) {
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
    setSelectedWords((prev) => {
      const newSelection = prev.filter((word) => {
        // Get the text representation of the word for comparison
        let wordText;

        if (typeof word === "string") {
          wordText = word;
        } else {
          // If it's not a string, try to find the corresponding word object
          const foundWord = availableWords.find((w) => w._id === word);
          wordText = foundWord?.text || word;
        }

        // Return true to keep the word, false to remove it
        return wordText !== wordToRemove;
      });

      // If all words are removed, clean up localStorage
      if (newSelection.length === 0) {
        localStorage.removeItem("poit_daily_words_in_progress");
      }

      return newSelection;
    });
  };

  const handleSelectorMove = (position) => {
    setSelectorPosition(position);
  };

  const handlePulseComplete = () => {
    // Show the words modal with Continue button
    setShowSelectedWords(true);
  };

  const handleComplete = () => {
    // Remove in-progress data once we're done with selection
    localStorage.removeItem("poit_daily_words_in_progress");

    // Pass the selected words to the parent component
    onComplete(getSelectedWordTexts());
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
        onSave={onSave}
        onExitToHome={onExitToHome}
        lastSaved={lastSaved}
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

        <GrowingWordSelector
          selectedWords={selectedWords}
          minWords={5}
          maxWords={20}
          onMove={handleSelectorMove}
          onComplete={handlePulseComplete}
          onStart={() => setIsActive(true)}
          active={isActive}
        />

        {/* Selected Words Modal */}
        <SelectedWordsModal
          isOpen={showSelectedWords}
          onClose={() => setShowSelectedWords(false)}
          selectedWords={getSelectedWordTexts()}
          onRemoveWord={handleRemoveWord}
          minWords={5}
          maxWords={20}
          onContinue={selectedWords.length >= 5 ? handleComplete : null}
        />
      </div>
    </div>
  );
};

export default PulseMode;
