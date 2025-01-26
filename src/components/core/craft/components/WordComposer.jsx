import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const WordComposer = ({ word, isSelected, onSelect, onMove, preview }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (preview) return;

    // Calculate offset from the word's top-left corner
    const rect = elementRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setIsDragging(true);
    onSelect?.(word.id);

    // Capture pointer to get events outside the element
    elementRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    // Get parent canvas bounds
    const canvasBounds =
      elementRef.current.parentElement.getBoundingClientRect();

    // Calculate new position relative to canvas
    const x = e.clientX - canvasBounds.left - dragOffset.current.x;
    const y = e.clientY - canvasBounds.top - dragOffset.current.y;

    // Constrain to canvas bounds
    const wordWidth = elementRef.current.offsetWidth;
    const wordHeight = elementRef.current.offsetHeight;

    const boundedX = Math.max(0, Math.min(canvasBounds.width - wordWidth, x));
    const boundedY = Math.max(0, Math.min(canvasBounds.height - wordHeight, y));

    onMove?.(word.id, { x: boundedX, y: boundedY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (elementRef.current) {
      elementRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <motion.div
      ref={elementRef}
      className={`
        absolute cursor-move select-none touch-none
        ${isDragging ? "z-10" : ""}
      `}
      style={{
        left: word.position?.x || 0,
        top: word.position?.y || 0,
        touchAction: "none", // Prevents touch scrolling while dragging
      }}
      initial={false}
      animate={{
        scale: isDragging ? 1.05 : isSelected ? 1.02 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 blur-xl rounded-full transition-opacity"
        style={{
          background: `radial-gradient(circle at 50% 50%,
            rgba(147, 197, 253, ${isDragging ? 0.4 : isSelected ? 0.3 : 0.15}),
            transparent 70%)`,
          opacity: isDragging ? 1 : 0.5,
        }}
      />

      {/* Word container */}
      <div
        className={`
        relative px-4 py-2 rounded-lg
        backdrop-blur-sm transition-all
        ${
          isDragging
            ? "bg-white/20"
            : isSelected
            ? "bg-white/15"
            : "bg-white/10"
        }
      `}
      >
        <span className="text-white font-medium">{word.text}</span>

        {/* Selection indicator */}
        {isSelected && !isDragging && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-cyan-400"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute inset-0 rounded-lg blur-sm bg-cyan-400/20" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WordComposer;
