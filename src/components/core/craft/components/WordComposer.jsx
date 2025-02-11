import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const WordComposer = ({
  word,
  isSelected,
  onSelect,
  onMove,
  onReturn,
  preview,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const elementRef = useRef(null);
  const lastClickTime = useRef(0);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (preview) return;

    const now = Date.now();
    if (now - lastClickTime.current < 300) {
      // Double click detected
      onReturn?.(word.id);
      return;
    }
    lastClickTime.current = now;

    // Calculate offset from the word's top-left corner
    const rect = elementRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setIsDragging(true);
    onSelect?.(word.id);

    elementRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const canvasBounds =
      elementRef.current.parentElement.getBoundingClientRect();
    const x = e.clientX - canvasBounds.left - dragOffset.current.x;
    const y = e.clientY - canvasBounds.top - dragOffset.current.y;

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
            rgba(44, 140, 124, ${isDragging ? 0.4 : isSelected ? 0.3 : 0.15}),
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
              ? "bg-[#2C8C7C]/20"
              : isSelected
              ? "bg-[#2C8C7C]/15"
              : "bg-white/10"
          }
        `}
      >
        <span className="text-[#2C8C7C] font-medium">{word.text}</span>

        {/* Selection indicator */}
        {isSelected && !isDragging && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-[#2C8C7C]"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute inset-0 rounded-lg blur-sm bg-[#2C8C7C]/20" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WordComposer;
