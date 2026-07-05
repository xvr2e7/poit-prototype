import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { perlin } from "../../../../utils/animations/animationUtils";
import { API_URL } from "../../../../utils/api";

const MAX_SLOW_FACTOR = 0.15;
const MOTION_SMOOTHING = 0.08;

const lerp = (start, end, t) => start * (1 - t) + end * t;

// POS auras drawn from the painter's mineral tray
const POS_COLORS = {
  noun: {
    base: "rgba(214, 168, 74",    // gamboge
    ring: "rgba(178, 132, 40",
  },
  verb: {
    base: "rgba(110, 156, 180",   // azurite
    ring: "rgba(74, 122, 150",
  },
  adj: {
    base: "rgba(164, 138, 192",   // mineral violet
    ring: "rgba(138, 111, 168",
  },
  default: {
    base: "rgba(110, 156, 180",
    ring: "rgba(74, 122, 150",
  },
};

const getWordColors = (word) => POS_COLORS[word.type] || POS_COLORS.default;

// Definition tooltip component
const DefinitionTooltip = ({ definition, type, visible }) => {
  if (!visible) return null;

  const posLabel = { noun: "noun", verb: "verb", adj: "adj", adv: "adv" }[type] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-50"
      style={{ bottom: "calc(100% + 8px)", minWidth: 160, maxWidth: 240 }}
    >
      <div className="bg-surface/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-ink/15 shadow-leaf dark:shadow-leaf-dark">
        {posLabel && (
          <span className="font-mono text-[10px] uppercase tracking-label text-seal/70 block mb-0.5">
            {posLabel}
          </span>
        )}
        {definition ? (
          <p className="font-serif text-xs text-ink/80 leading-relaxed">{definition}</p>
        ) : (
          <p className="font-serif text-xs text-ink/40 italic">looking it up…</p>
        )}
      </div>
    </motion.div>
  );
};

const FloatingWord = ({
  word,
  isSelected,
  interactingWord,
  interactionProgress,
  proximityMap,
  onPositionUpdate,
  onRequestDefinition,
}) => {
  const elementRef = useRef(null);
  const glowRef = useRef(null);
  const timeRef = useRef(Math.random() * 1000);
  const currentPosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const [isAbsorbed, setIsAbsorbed] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [definition, setDefinition] = useState(word.definition || null);
  const hoverTimerRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isInteracting = interactingWord === word.text;
  const baseSize = Math.max(120, word.text.length * 15);
  const finalSize = baseSize * word.sizeMultiplier;
  const proximity = proximityMap?.get(word.text) || 0;
  const colors = getWordColors(word);

  // Mystery word state
  const isMystery = word.isMystery;
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  // Mystery word reveal based on proximity
  useEffect(() => {
    if (!isMystery) return;
    if (proximity > 0.3) {
      setRevealProgress(Math.min(1, (proximity - 0.3) / 0.5));
    } else {
      setRevealProgress(0);
    }
  }, [proximity, isMystery]);

  // Fetch definition on hover
  const handleHoverStart = useCallback(() => {
    hoverTimerRef.current = setTimeout(async () => {
      if (!definition && onRequestDefinition) {
        const def = await onRequestDefinition(word.text);
        if (def && isMountedRef.current) setDefinition(def);
      }
      if (isMountedRef.current) setShowDefinition(true);
    }, 600);
  }, [definition, onRequestDefinition, word.text]);

  const handleHoverEnd = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowDefinition(false);
  }, []);

  // Long press for mobile
  const handleTouchStart = useCallback(() => {
    longPressTimerRef.current = setTimeout(async () => {
      if (!definition && onRequestDefinition) {
        const def = await onRequestDefinition(word.text);
        if (def && isMountedRef.current) setDefinition(def);
      }
      if (isMountedRef.current) setShowDefinition(true);
    }, 500);
  }, [definition, onRequestDefinition, word.text]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    setShowDefinition(false);
  }, []);

  // Get displayed text for mystery words
  const getDisplayText = () => {
    if (!isMystery || revealProgress >= 1) return word.text;
    if (revealProgress === 0) return "???";

    const chars = word.text.split("");
    const revealCount = Math.floor(chars.length * revealProgress);
    return chars
      .map((c, i) => (i < revealCount ? c : "?"))
      .join("");
  };

  // Main animation loop
  useEffect(() => {
    if (!elementRef.current) return;

    let rafId;
    const baseX = (word.basePosition.x / 100) * window.innerWidth;
    const baseY = (word.basePosition.y / 100) * window.innerHeight;

    if (currentPosition.current.x === 0) {
      currentPosition.current = { x: baseX, y: baseY };
      targetPosition.current = { x: baseX, y: baseY };
    }

    const animate = () => {
      if (!isMountedRef.current || !elementRef.current) return;

      timeRef.current += 0.002;
      const time = timeRef.current;

      const xNoise = perlin(time * 0.3) * 100;
      const yNoise = perlin(time * 0.2 + 1000) * 100;

      targetPosition.current.x = baseX + xNoise;
      targetPosition.current.y = baseY + yNoise;

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

      const slowFactor = proximity
        ? 1 - MAX_SLOW_FACTOR * Math.pow(proximity, 3)
        : 1;

      const x = currentPosition.current.x;
      const y = currentPosition.current.y;
      const rotation = Math.sin(time * 0.2) * 2 * slowFactor;

      if (elementRef.current) {
        elementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      }

      if (glowRef.current) {
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
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    word,
    isAbsorbed,
    isInteracting,
    interactionProgress,
    onPositionUpdate,
    proximity,
  ]);

  useEffect(() => {
    if (isSelected && !isAbsorbed) {
      setIsAbsorbed(true);
    }
  }, [isSelected, isAbsorbed]);

  const displayText = getDisplayText();

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
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Definition tooltip */}
      <AnimatePresence>
        {showDefinition && (
          <DefinitionTooltip
            definition={definition}
            type={word.type}
            visible={showDefinition}
          />
        )}
      </AnimatePresence>

      <svg viewBox="-50 -50 100 100" width={finalSize} height={finalSize}>
        <defs>
          <radialGradient id={`glow-${word._id || word.text}`}>
            <stop
              offset="0%"
              stopColor={`${colors.base}, ${
                isInteracting ? 0.85 : 0.75 + proximity * 0.15
              })`}
            />
            <stop
              offset="40%"
              stopColor={`${colors.base}, ${
                isInteracting ? 0.35 : 0.25 + proximity * 0.1
              })`}
            />
            <stop offset="100%" stopColor={`${colors.ring}, 0)`} />
          </radialGradient>

          {(isInteracting || proximity > 0) && (
            <radialGradient id={`progress-${word._id || word.text}`}>
              <stop offset="0%" stopColor={`${colors.base}, 0.25)`} />
              <stop
                offset={`${(interactionProgress + proximity) * 100}%`}
                stopColor={`${colors.base}, 0.08)`}
              />
              <stop offset="100%" stopColor={`${colors.ring}, 0)`} />
            </radialGradient>
          )}
        </defs>

        {/* Progress ring */}
        {(isInteracting || proximity > 0) && (
          <circle
            r="45"
            fill={`url(#progress-${word._id || word.text})`}
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
              const radius = 35 + Math.sin(time * 3 + i * 0.5) * 5;
              const x = Math.cos(angle) * radius * scale;
              const y = Math.sin(angle) * radius * scale;

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={1.5 + Math.sin(time + i) * 0.5}
                    fill={`${colors.base}, 0.6)`}
                    className="animate-pulse"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.6;0.2;0.6"
                      dur={`${1.5 + i * 0.2}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  <path
                    d={`M ${x} ${y} Q ${x * 0.8} ${y * 0.8} 0 0`}
                    stroke={`${colors.base}, 0.2)`}
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
          fill={`url(#glow-${word._id || word.text})`}
          className="transition-opacity duration-500"
        />

        {/* Additional interaction glow rings */}
        {(isInteracting || proximity > 0.2) && (
          <>
            <circle
              r="42"
              stroke={`${colors.base}, 0.2)`}
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
              stroke={`${colors.base}, 0.15)`}
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

        {/* Mystery word shimmer overlay */}
        {isMystery && revealProgress < 1 && (
          <circle
            r="38"
            fill="none"
            stroke={`${colors.base}, ${0.4 - revealProgress * 0.3})`}
            strokeWidth="1"
            strokeDasharray="4 4"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0;360"
              dur="8s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Word text */}
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-ink/85 pointer-events-none select-none"
          style={{
            fontFamily: "Spectral, Georgia, serif",
            fontSize: Math.max(12, 24 - word.text.length * 0.8),
            fontWeight: 500,
            letterSpacing: isMystery && revealProgress < 1 ? "0.1em" : "0",
          }}
          fill="currentColor"
        >
          {displayText}
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
  // Definition cache
  const definitionCache = useRef(new Map());

  // Add unique positioning and mystery tags for each word
  const processedWords = useMemo(() => {
    const wordsWithPositions = words.map((word) => ({
      ...word,
      sizeMultiplier: 1 + Math.random() * 0.4,
      basePosition: {
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
    }));

    // Tag 2-3 random words as mystery
    const mysteryCount = Math.min(3, Math.floor(wordsWithPositions.length / 15));
    const indices = new Set();
    while (indices.size < mysteryCount) {
      indices.add(Math.floor(Math.random() * wordsWithPositions.length));
    }
    indices.forEach((i) => {
      wordsWithPositions[i].isMystery = true;
    });

    return wordsWithPositions;
  }, [words]);

  const handleRequestDefinition = useCallback(async (wordText) => {
    if (definitionCache.current.has(wordText)) {
      return definitionCache.current.get(wordText);
    }

    try {
      const res = await fetch(`${API_URL}/words/define/${encodeURIComponent(wordText)}`);
      if (!res.ok) return null;
      const data = await res.json();
      const def = data.definition || null;
      definitionCache.current.set(wordText, def);
      return def;
    } catch {
      return null;
    }
  }, []);

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
            onRequestDefinition={handleRequestDefinition}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WordPool;
