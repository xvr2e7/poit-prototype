import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Calendar, Clock } from "lucide-react";
import UIBackground from "../../shared/UIBackground";
import { usePoemConnections } from "./hooks/usePoemConnections";

const CentralPoem = ({ poem }) => {
  if (!poem) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative max-w-4xl w-full mx-auto"
    >
      {/* Ambient glow effects */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent 
        blur-3xl rounded-full scale-150 -z-10"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/10 
        to-blue-500/5 blur-2xl rounded-full scale-125 -z-10"
      />

      {/* Main card container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
          mass: 1,
        }}
        className="backdrop-blur-md bg-white/5 border border-cyan-500/20 
          rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="px-8 py-6 border-b border-cyan-500/20 
            bg-gradient-to-r from-cyan-500/10 to-transparent"
        >
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="text-2xl font-semibold text-cyan-50 mb-4"
          >
            {poem.title}
          </motion.h2>

          {/* Metadata row */}
          <div className="flex items-center space-x-6">
            {/* Author */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex items-center space-x-2 text-cyan-300/70"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">{poem.author}</span>
            </motion.div>

            {/* Date */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.4,
                duration: 0.6,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex items-center space-x-2 text-cyan-300/70"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{poem.date}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Poem content */}
        <div className="p-8">
          {poem.content.map((stanza, stanzaIndex) => (
            <div key={stanzaIndex} className="mb-8 last:mb-0">
              {stanza.map((line, lineIndex) => (
                <motion.div
                  key={lineIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.4 + stanzaIndex * 0.1 + lineIndex * 0.04,
                    duration: 0.8,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  className="text-cyan-100/90 text-lg leading-relaxed tracking-wide font-light"
                >
                  {line}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.6,
            duration: 0.8,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="px-8 py-4 border-t border-cyan-500/20 
            bg-gradient-to-r from-transparent to-cyan-500/10"
        >
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-sm text-cyan-300/60"
            >
              Words will guide your exploration...
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex items-center space-x-2 text-sm text-cyan-300/60"
            >
              <Clock className="w-4 h-4" />
              <span>Recently created</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const LoadingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="absolute inset-0 flex items-center justify-center"
  >
    <div className="flex items-center space-x-2">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-2 h-2 bg-cyan-400/50 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
        className="w-2 h-2 bg-cyan-400/50 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
        className="w-2 h-2 bg-cyan-400/50 rounded-full"
      />
    </div>
  </motion.div>
);

const EchoMode = ({
  onComplete,
  playgroundUnlocked,
  enterPlayground,
  enabled = true,
  poems = [],
  currentPoem = null,
}) => {
  const [activePoem, setActivePoem] = useState(currentPoem || poems[0]);
  const [isLoading, setIsLoading] = useState(true);
  const poemAnalysis = usePoemConnections(poems);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!enabled || poems.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="text-cyan-300">Loading poems...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <UIBackground mode="echo" />

      {/* Top navigation bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-20 px-8 py-4"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-300/50" />
            <input
              type="text"
              placeholder="Search poems..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-cyan-500/20 
                rounded-lg text-cyan-100 placeholder-cyan-300/30 focus:outline-none
                focus:bg-white/10 focus:border-cyan-500/40 transition-colors duration-200"
            />
          </div>

          {playgroundUnlocked && (
            <button
              onClick={enterPlayground}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 
                text-cyan-300 rounded-lg border border-cyan-500/40
                transition-colors duration-300"
            >
              Enter Playground
            </button>
          )}
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {isLoading ? <LoadingIndicator /> : <CentralPoem poem={activePoem} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EchoMode;
