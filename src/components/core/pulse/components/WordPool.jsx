import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { perlin } from "../../../../utils/animations/animationUtils";

const MAX_SLOW_FACTOR = 0.15; // Reduced maximum slowdown
const MOTION_SMOOTHING = 0.08; // Lower = smoother transitions

// Linear interpolation function
const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
};

const FloatingWord = ({
  word,
  isSelected,
  interactingWord,
  interactionProgress,
  proximityMap,
  onPositionUpdate,
}) => {
  const elementRef = useRef(null);
  const glowRef = useRef(null);
  const timeRef = useRef(Math.random() * 1000);
  const currentPosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const [isAbsorbed, setIsAbsorbed] = useState(false);
  const isMountedRef = useRef(true);
  const isInteracting = interactingWord === word.text;
  const baseSize = Math.max(120, word.text.length * 15);
  const finalSize = baseSize * word.sizeMultiplier;
  const proximity = proximityMap?.get(word.text) || 0;

  // Setup and cleanup mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    if (!elementRef.current) return;

    let rafId;
    const baseX = (word.basePosition.x / 100) * window.innerWidth;
    const baseY = (word.basePosition.y / 100) * window.innerHeight;

    // Initialize positions if they're at 0
    if (currentPosition.current.x === 0) {
      currentPosition.current = { x: baseX, y: baseY };
      targetPosition.current = { x: baseX, y: baseY };
    }

    const animate = () => {
      if (!isMountedRef.current || !elementRef.current) {
        return;
      }

      timeRef.current += 0.002; // Slowed down base time increment
      const time = timeRef.current;

      // Calculate base motion using perlin noise
      const xNoise = perlin(time * 0.3) * 100;
      const yNoise = perlin(time * 0.2 + 1000) * 100;

      // Set target position with base motion
      targetPosition.current.x = baseX + xNoise;
      targetPosition.current.y = baseY + yNoise;

      // Smoothly interpolate current position
      currentPosition.current.x = lerp(
        currentPosition.current.x,
        targetPosition.current.x,
        MOTION_SMOOTHING
      );
      currentPosition.current.y = lerp(
        currentPosition.current.y,
        targetPosition.current.y,
        MOTION_SMOOTHING
      );

      // Calculate slowdown based on proximity
      const slowFactor = proximity
        ? 1 - MAX_SLOW_FACTOR * Math.pow(proximity, 3) // More gradual slowdown curve
        : 1;

      // Apply movement with smooth transitions
      const x = currentPosition.current.x;
      const y = currentPosition.current.y;

      // Gentle rotation based on movement
      const rotation = Math.sin(time * 0.2) * 2 * slowFactor;

      if (elementRef.current) {
        elementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      }

      // Update glow effects
      if (glowRef.current) {
        // Smoother glow transitions
        const baseGlow = 0.6 + Math.sin(time * 0.5) * 0.1;
        const proximityGlow = proximity * 0.2;
        const interactionGlow = isInteracting ? interactionProgress * 0.3 : 0;
        const totalGlow = Math.min(
          0.9,
          baseGlow + proximityGlow + interactionGlow
        );

        const currentGlow =
          parseFloat(glowRef.current.style.opacity) || baseGlow;
        glowRef.current.style.opacity = lerp(currentGlow, totalGlow, 0.1);
      }

      if (!isAbsorbed && elementRef.current) {
        onPositionUpdate(word.text, elementRef.current.getBoundingClientRect());
      }

      if (isMountedRef.current) {
        rafId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [
    word,
    isAbsorbed,
    isInteracting,
    interactionProgress,
    onPositionUpdate,
    proximity,
  ]);

  // Handle selection state changes
  useEffect(() => {
    if (isSelected && !isAbsorbed) {
      setIsAbsorbed(true);
    }
  }, [isSelected, isAbsorbed]);
  return (
    <motion.div
      ref={elementRef}
      className="absolute left-0 top-0"
      initial={{ opacity: 1, scale: 1 }}
      animate={
        isAbsorbed
          ? {
              opacity: [1, 0.8, 0],
              scale: [1, 1.2, 0],
              transition: {
                duration: 0.8,
                ease: "easeInOut",
                times: [0, 0.3, 1],
              },
            }
          : {
              opacity: 1,
              scale: 1 + (isInteracting ? interactionProgress * 0.15 : 0),
              transition: { duration: 0.4 },
            }
      }
    >
      <svg viewBox="-50 -50 100 100" width={finalSize} height={finalSize}>
        <defs>
          <radialGradient id={`glow-${word._id}`}>
            <stop
              offset="0%"
              stopColor={`rgba(147, 197, 253, ${
                isInteracting ? 0.85 : 0.75 + proximity * 0.15
              })`}
            />
            <stop
              offset="40%"
              stopColor={`rgba(147, 197, 253, ${
                isInteracting ? 0.35 : 0.25 + proximity * 0.1
              })`}
            />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>

          {(isInteracting || proximity > 0) && (
            <radialGradient id={`progress-${word._id}`}>
              <stop offset="0%" stopColor="rgba(147, 197, 253, 0.25)" />
              <stop
                offset={`${(interactionProgress + proximity) * 100}%`}
                stopColor="rgba(147, 197, 253, 0.08)"
              />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </radialGradient>
          )}
        </defs>

        {/* Progress ring with smoother appearance */}
        {(isInteracting || proximity > 0) && (
          <circle
            r="45"
            fill={`url(#progress-${word._id})`}
            className="transition-opacity duration-500"
          />
        )}

        {/* Interaction particles */}
        {(isInteracting || proximity > 0.3) && (
          <g>
            {[...Array(8)].map((_, i) => {
              const baseAngle = (i / 8) * Math.PI * 2;
              const time = timeRef.current;
              const wobble = Math.sin(time * 2 + i) * 0.3;
              const angle = baseAngle + wobble;
              const scale = isInteracting ? interactionProgress : proximity;

              // Dynamic radius based on interaction state
              const radius = 35 + Math.sin(time * 3 + i * 0.5) * 5;
              const x = Math.cos(angle) * radius * scale;
              const y = Math.sin(angle) * radius * scale;

              return (
                <g key={i}>
                  {/* Main particle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={1.5 + Math.sin(time + i) * 0.5}
                    fill="rgba(147, 197, 253, 0.6)"
                    className="animate-pulse"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.6;0.2;0.6"
                      dur={`${1.5 + i * 0.2}s`}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Particle trail */}
                  <path
                    d={`M ${x} ${y} Q ${x * 0.8} ${y * 0.8} 0 0`}
                    stroke="rgba(147, 197, 253, 0.2)"
                    strokeWidth="0.5"
                    fill="none"
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.3;0.1;0.3"
                      dur={`${2 + i * 0.2}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              );
            })}
          </g>
        )}

        {/* Base glow */}
        <circle
          ref={glowRef}
          r="40"
          fill={`url(#glow-${word._id})`}
          className="transition-opacity duration-500"
        />

        {/* Additional interaction glow rings */}
        {(isInteracting || proximity > 0.2) && (
          <>
            <circle
              r="42"
              stroke="rgba(147, 197, 253, 0.2)"
              strokeWidth="0.5"
              fill="none"
            >
              <animate
                attributeName="r"
                values="42;44;42"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.2;0.1;0.2"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              r="43"
              stroke="rgba(147, 197, 253, 0.15)"
              strokeWidth="0.5"
              fill="none"
            >
              <animate
                attributeName="r"
                values="43;45;43"
                dur="2.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.15;0.05;0.15"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        )}

        {/* Word text */}
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-white pointer-events-none select-none"
          style={{
            fontSize: Math.max(12, 24 - word.text.length * 0.8),
            fontWeight: 500,
          }}
        >
          {word.text}
        </text>
      </svg>
    </motion.div>
  );
};

const WordPool = ({
  words = [],
  selectedWords = [],
  onPositionUpdate,
  interactingWord,
  interactionProgress,
  proximityMap,
}) => {
  console.log("WordPool received words:", words); // Debug log

  // Add unique positioning for each word
  const processedWords = useMemo(
    () =>
      words.map((word) => ({
        ...word,
        // No need to add type to id, just use the text
        sizeMultiplier: 1 + Math.random() * 0.4,
        basePosition: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      })),
    [words]
  );

  console.log("Processed words:", processedWords); // Debug log

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {processedWords.map((word) => (
          <FloatingWord
            key={word.text}
            word={word}
            isSelected={selectedWords.includes(word.text)}
            interactingWord={interactingWord}
            interactionProgress={interactionProgress}
            proximityMap={proximityMap}
            onPositionUpdate={onPositionUpdate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WordPool;
