import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordPool from "./components/WordPool";
import WordInteraction from "./components/WordInteraction";
import GrowingWordSelector from "./components/GrowingWordSelector";
import UIBackground from "../../shared/UIBackground";
import { TimeDisplay } from "./components/TimeDisplay";
import { CompletionView } from "./components/CompletionView";

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

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between p-4 mt-4 rounded-xl border border-cyan-500/20 backdrop-blur-sm bg-white/5">
          <motion.h1
            className="text-2xl font-bold text-cyan-300"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Pulse
          </motion.h1>
          <TimeDisplay />
        </div>
      </div>

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

const StatusMessage = ({ isActive, selectedWords, minWords, maxWords }) => (
  <AnimatePresence mode="wait">
    {!isActive ? (
      <motion.div
        key="start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-cyan-300/60 text-sm"
      >
        Click anywhere to begin
      </motion.div>
    ) : (
      <motion.div
        key="progress"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-cyan-300/60 text-sm"
      >
        {selectedWords.length < minWords
          ? `Words collected: ${selectedWords.length}/${minWords} minimum`
          : selectedWords.length < maxWords
          ? `${selectedWords.length} words collected (double-click to finish)`
          : "Maximum words reached"}
      </motion.div>
    )}
  </AnimatePresence>
);

export default PulseMode;
