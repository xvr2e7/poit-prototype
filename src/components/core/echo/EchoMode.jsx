import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, Calendar, Clock } from "lucide-react";
import UIBackground from "../../shared/UIBackground";
import { usePoemConnections } from "./hooks/usePoemConnections";

const CentralPoem = ({ poem }) => {
  if (!poem) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative max-w-4xl w-full"
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

        {/* Poem card */}
        <div
          className="backdrop-blur-md bg-white/5 border border-cyan-500/20 
          rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header with metadata */}
          <div
            className="px-8 py-6 border-b border-cyan-500/20 
            bg-gradient-to-r from-cyan-500/10 to-transparent"
          >
            <h2 className="text-2xl font-semibold text-cyan-50 mb-4">
              {poem.title}
            </h2>
            <div className="flex items-center space-x-6 text-cyan-300/70">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{poem.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{poem.date}</span>
              </div>
            </div>
          </div>

          {/* Poem content */}
          <div className="p-8">
            {poem.content.map((stanza, stanzaIndex) => (
              <div key={stanzaIndex} className="mb-8 last:mb-0">
                {stanza.map((line, lineIndex) => (
                  <motion.div
                    key={lineIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: (stanzaIndex * stanza.length + lineIndex) * 0.1,
                    }}
                    className="text-cyan-100/90 text-lg leading-relaxed 
                      tracking-wide font-light"
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>

          {/* Footer with interaction hints */}
          <div
            className="px-8 py-4 border-t border-cyan-500/20 
            bg-gradient-to-r from-transparent to-cyan-500/10"
          >
            <div className="flex justify-between items-center">
              <div className="text-sm text-cyan-300/60">
                Words will guide your exploration...
              </div>
              <div className="flex items-center space-x-2 text-sm text-cyan-300/60">
                <Clock className="w-4 h-4" />
                <span>Recently created</span>
              </div>
            </div>
          </div>

          {/* Interactive particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EchoMode = ({
  onComplete,
  playgroundUnlocked,
  enterPlayground,
  enabled = true,
  poems = [],
  currentPoem = null,
}) => {
  const [activePoem, setActivePoem] = useState(currentPoem || poems[0]);
  const poemAnalysis = usePoemConnections(poems);

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
      <div className="fixed top-0 left-0 right-0 z-20 px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-cyan-300/50" />
            <input
              type="text"
              placeholder="Search poems..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-cyan-500/20 
                rounded-lg text-cyan-100 placeholder-cyan-300/30 focus:outline-none
                focus:bg-white/10 focus:border-cyan-500/40"
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
      </div>

      {/* Main content area with central poem */}
      <main className="w-full min-h-screen">
        <CentralPoem poem={activePoem} />
      </main>
    </div>
  );
};

export default EchoMode;
