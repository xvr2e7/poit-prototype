import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordPool from "./components/WordPool";
import WordInteraction from "./components/WordInteraction";
import GrowingWordSelector from "./components/GrowingWordSelector";
import UIBackground from "../../shared/UIBackground";
import { TimeDisplay } from "./components/TimeDisplay";
import Navigation from "../../shared/Navigation";
import { CompletionView } from "./components/CompletionView";
import StatusMessage from "./components/StatusMessage";

const PulseMode = ({ onComplete }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [selectorPosition, setSelectorPosition] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [availableWords, setAvailableWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const wordPositionsRef = useRef(new Map());

  useEffect(() => {
    const fetchWords = async () => {
      try {
        // Get user's timezone
        let timezone;
        try {
          const timeZoneDetector = Intl.DateTimeFormat();
          const resolvedOptions = timeZoneDetector.resolvedOptions();
          timezone = resolvedOptions.timeZone;
          console.log("Detected timezone:", timezone); // Debug log
        } catch (error) {
          console.error("Timezone detection error:", error);
          timezone = "UTC";
        }

        console.log("Making request with timezone:", timezone); // Debug log

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
        console.log("Response data:", {
          wordsCount: data.words?.length,
          refreshedAt: data.refreshedAt,
          nextRefresh: data.nextRefresh,
        }); // Debug log

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
    console.log("Word selected:", wordId);
    if (!selectedWords.includes(wordId)) {
      const newSelectedWords = [...selectedWords, wordId];
      setSelectedWords(newSelectedWords);

      if (newSelectedWords.length >= 10) {
        handlePulseComplete();
      }
    }
  };
  const getSelectedWordTexts = () => {
    return selectedWords.map((id) => {
      const word = availableWords.find((w) => w._id === id);
      return word ? word.text : "";
    });
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

  const handleCompletionSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      onComplete(getSelectedWordTexts());
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen relative overflow-hidden">
        <UIBackground mode="pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-cyan-300">Loading words...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <UIBackground mode="pulse" />

      <Navigation
        currentMode="pulse"
        setCurrentMode={() => {}}
        lockedModes={{}}
        inPlayground={false}
      />
      <TimeDisplay />

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
            onMove={setSelectorPosition}
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
                setTimeout(() => onComplete(selectedWords), 1000);
              }}
              saved={isSaved}
              selectedWords={selectedWords}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status message */}
      {!showCompletion && (
        <StatusMessage
          isActive={isActive}
          selectedWords={selectedWords}
          minWords={5}
          maxWords={10}
        />
      )}
    </div>
  );
};

export default PulseMode;
