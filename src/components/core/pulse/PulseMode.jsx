import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordPool from "./components/WordPool";
import WordInteraction from "./components/WordInteraction";
import GrowingWordSelector from "./components/GrowingWordSelector";
import PulseBackground from "./components/PulseBackground";
import { TimeDisplay } from "./components/TimeDisplay";
import { CompletionView } from "./components/CompletionView";

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

const PulseMode = ({ onComplete }) => {
  const [selectedWords, setSelectedWords] = useState([]);
  const [selectorPosition, setSelectorPosition] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const wordPositionsRef = useRef(new Map());

  const handleWordPositionUpdate = (wordId, rect) => {
    wordPositionsRef.current.set(wordId, rect);
  };

  const handleWordSelect = (wordId) => {
    if (!selectedWords.includes(wordId)) {
      const newSelectedWords = [...selectedWords, wordId];
      setSelectedWords(newSelectedWords);

      // Show completion view immediately if max words reached
      if (newSelectedWords.length >= 45) {
        setShowCompletion(true);
      }
    }
  };

  const handleSelectorMove = (position) => {
    setSelectorPosition(position);
  };

  const handleSelectorStart = () => {
    setIsActive(true);
  };

  const handlePulseComplete = () => {
    setShowCompletion(true);
  };

  const handleCompletionSave = () => {
    setIsSaved(true);
    // Add a slight delay before transitioning to allow save animation to play
    setTimeout(() => {
      onComplete(selectedWords);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <PulseBackground />

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
            selectedWords={selectedWords}
            onPositionUpdate={handleWordPositionUpdate}
          />
        </WordInteraction>

        <GrowingWordSelector
          selectedWords={selectedWords}
          minWords={5} // TODO: Adjust based on word count
          maxWords={10} // TODO: Adjust based on word count
          onMove={handleSelectorMove}
          onComplete={handlePulseComplete}
          onStart={handleSelectorStart}
          active={isActive}
        />

        <AnimatePresence>
          {showCompletion && (
            <CompletionView
              onSave={handleCompletionSave}
              saved={isSaved}
              selectedWords={selectedWords}
            />
          )}
        </AnimatePresence>
      </div>

      {!showCompletion && (
        <StatusMessage
          isActive={isActive}
          selectedWords={selectedWords}
          minWords={5} // TODO: Adjust based on word count
          maxWords={10} // TODO: Adjust based on word count
        />
      )}
    </div>
  );
};

export default PulseMode;
