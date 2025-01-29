import React, { useState, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { User, Calendar, Clock } from "lucide-react";
import UIBackground from "../../shared/UIBackground";

// Memoized word/punctuation component for performance
const WordComponent = memo(({ component, isHighlighted, onHover }) => {
  const baseScale = component.type === "punctuation" ? 0.8 : 1;

  return (
    <motion.div
      className="absolute pointer-events-auto"
      style={{
        left: component.position.x,
        top: component.position.y,
      }}
      initial={{ opacity: 0, scale: baseScale * 0.8 }}
      animate={{
        opacity: 1,
        scale: baseScale,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => onHover?.(component)}
      onHoverEnd={() => onHover?.(null)}
    >
      <div
        className={`
        relative px-6 py-3 rounded-lg backdrop-blur-sm 
        transition-colors duration-300
        ${
          isHighlighted
            ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
            : "bg-white/5 text-cyan-200/70 hover:bg-white/10"
        }
        ${component.type === "punctuation" ? "text-cyan-300/50" : ""}
        font-medium
      `}
      >
        {isHighlighted && (
          <div
            className="absolute inset-0 -z-10 rounded-lg"
            style={{
              background: `
                radial-gradient(
                  circle at center,
                  rgba(34, 211, 238, 0.4) 0%,
                  rgba(34, 211, 238, 0.2) 40%,
                  rgba(34, 211, 238, 0) 70%
                )
              `,
              transform: "scale(1.5)",
              opacity: 0.6,
            }}
          />
        )}

        <span className="relative z-10 select-none whitespace-nowrap">
          {component.text}
        </span>
      </div>
    </motion.div>
  );
});

WordComponent.displayName = "WordComponent";

const EchoMode = ({
  poem,
  wordPool = [],
  onComplete,
  playgroundUnlocked,
  enterPlayground,
  enabled = true,
}) => {
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Optimized scroll handling
  const { scrollY } = useScroll({
    container: containerRef,
  });

  const smoothY = useSpring(scrollY, {
    damping: 50,
    stiffness: 400,
  });

  // Memoized highlight check
  const shouldHighlight = useCallback(
    (component) => {
      if (component.type !== "word") return false;
      return wordPool.some(
        (word) => word.text.toLowerCase() === component.text.toLowerCase()
      );
    },
    [wordPool]
  );

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!enabled || !poem) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="text-cyan-300">Loading poem...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden p-8">
      <UIBackground mode="echo" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-full max-w-6xl mx-auto"
      >
        {/* Ambient effects */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent 
            blur-3xl rounded-full scale-150"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/10 
            to-blue-500/5 blur-2xl rounded-full scale-125"
          />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-full backdrop-blur-md bg-white/5 border border-cyan-500/20 
            rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div
            className="px-8 py-6 border-b border-cyan-500/20 
            bg-gradient-to-r from-cyan-500/10 to-transparent"
          >
            <div className="flex justify-between items-start mb-4">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-semibold text-cyan-50"
              >
                {poem.title}
              </motion.h2>

              {playgroundUnlocked && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={enterPlayground}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 
                    text-cyan-300 rounded-lg border border-cyan-500/40
                    transition-colors duration-300"
                >
                  Enter Playground
                </motion.button>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-cyan-300/70">
                <User className="w-4 h-4" />
                <span className="text-sm">{poem.author}</span>
              </div>
              <div className="flex items-center space-x-2 text-cyan-300/70">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{poem.date}</span>
              </div>
            </div>
          </div>

          {/* Scrollable poem space */}
          <div
            ref={containerRef}
            className="h-[calc(100%-10rem)] overflow-y-auto overflow-x-hidden"
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Content container with increased height for scrolling */}
            <div className="relative min-h-[200%] p-12">
              <AnimatePresence mode="wait">
                {!isLoading &&
                  poem.components.map((component) => (
                    <WordComponent
                      key={component.id}
                      component={component}
                      isHighlighted={shouldHighlight(component)}
                      onHover={setHoveredComponent}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div
            className="h-16 px-8 py-4 border-t border-cyan-500/20 
            bg-gradient-to-r from-transparent to-cyan-500/10"
          >
            <div className="flex justify-between items-center">
              <div className="text-sm text-cyan-300/60">
                {`${poem.metadata.highlightedWordCount} highlighted connections`}
              </div>
              <div className="flex items-center space-x-2 text-sm text-cyan-300/60">
                <Clock className="w-4 h-4" />
                <span>Recently created</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EchoMode;
