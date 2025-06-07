import React, { useState, useRef, useEffect } from "react";
import WordPool from "./components/WordPool";
import WordInteraction from "./components/WordInteraction";
import GrowingWordSelector from "./components/GrowingWordSelector";
import Navigation from "../../shared/Navigation";
import SelectedWordsModal from "./components/SelectedWordsModal";
import { getTestWordStrings } from "../../../utils/testData/devTestData";
import HelpModal from "../../shared/HelpModal";
import { CircleHelp } from "lucide-react";
import { motion } from "framer-motion";

const PulseMode = ({ onComplete, onExitToHome, onSave, lastSaved }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [selectorPosition, setSelectorPosition] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [showSelectedWords, setShowSelectedWords] = useState(false);
  const [availableWords, setAvailableWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const wordPositionsRef = useRef(new Map());

  // Check if user has seen tutorial before
  useEffect(() => {
    const tutorialKey = "hasSeenPulseTutorial";
    const hasSeenBefore = localStorage.getItem(tutorialKey);

    // Show tutorial automatically for first-time visitors
    if (!hasSeenBefore) {
      setTimeout(() => setShowHelp(true), 1000);
      localStorage.setItem(tutorialKey, "true");
    }
  }, []);

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
        // Always use dev test data
        const testWords = getTestWordStrings().map((text) => ({ text }));
        setAvailableWords(testWords);
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

    // Set flag to indicate pulse was explicitly completed
    localStorage.setItem("poit_pulse_completed", "true");

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
        onHelpClick={() => setShowHelp(true)}
      />

      {/* Help Button */}
      <motion.button
        onClick={() => setShowHelp(true)}
        className="fixed left-6 bottom-6 z-50 p-2 rounded-lg 
    bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/10
    hover:bg-white/10 transition-colors flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          marginLeft: "12px",
          width: "40px",
          height: "40px",
        }}
      >
        <CircleHelp className="w-5 h-5 text-[#2C8C7C]" />
      </motion.button>

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        mode="pulse"
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
