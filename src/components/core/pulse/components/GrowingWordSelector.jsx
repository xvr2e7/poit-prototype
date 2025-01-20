import React, { useEffect, useRef, useState } from "react";
import { perlin } from "../../../../utils/animations/animationUtils";

const GrowingWordSelector = ({
  selectedWords = [],
  minWords = 15,
  maxWords = 45,
  onMove = () => {},
  onWordInteraction = () => {},
}) => {
  const canvasRef = useRef(null);
  const positionHistoryRef = useRef([]);
  const headRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const wordInteractionRef = useRef({ wordId: null, startTime: null });
  const [segmentCount, setSegmentCount] = useState(3); // Initial body segments

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!headRef.current.x) {
        headRef.current = {
          x: canvas.width / 2,
          y: canvas.height / 2,
        };
      }
    };

    const getSegmentStyle = () => {
      const count = selectedWords.length;
      if (count < minWords) {
        return {
          color: [147, 197, 253], // Cool blue
          alpha: 0.8,
          baseSize: 12,
        };
      } else if (count <= maxWords) {
        const progress = (count - minWords) / (maxWords - minWords);
        return {
          color: [
            147 + progress * 58,
            197 - progress * 47,
            253 - progress * 53,
          ],
          alpha: 0.8 + progress * 0.2,
          baseSize: 12 + progress * 3,
        };
      } else {
        return {
          color: [245, 158, 11], // Warning amber
          alpha: 1,
          baseSize: 15,
        };
      }
    };

    const drawSegment = (x, y, size, color, alpha, index) => {
      // Add wave motion based on segment index
      const waveOffset = Math.sin(timeRef.current * 2 + index * 0.5) * 3;

      const gradient = ctx.createRadialGradient(
        x,
        y + waveOffset,
        0,
        x,
        y + waveOffset,
        size * 2
      );

      const segmentAlpha = Math.max(0.2, alpha - index * 0.05);
      gradient.addColorStop(0, `rgba(${color.join(",")}, ${segmentAlpha})`);
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y + waveOffset, size, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const style = getSegmentStyle();

      // Update head position with organic drift
      const driftX = perlin(time * 0.5) * 5;
      const driftY = perlin(time * 0.3 + 1000) * 5;

      const currentX = headRef.current.x + driftX;
      const currentY = headRef.current.y + driftY;

      // Store position history
      positionHistoryRef.current.unshift({ x: currentX, y: currentY, time });
      if (positionHistoryRef.current.length > 1000) {
        positionHistoryRef.current.pop();
      }

      // Draw body segments
      const totalSegments = segmentCount + selectedWords.length;
      for (let i = 0; i < totalSegments; i++) {
        const historyIndex = Math.min(
          i * 5,
          positionHistoryRef.current.length - 1
        );
        const pos = positionHistoryRef.current[historyIndex] || {
          x: currentX,
          y: currentY,
        };

        drawSegment(
          pos.x,
          pos.y,
          style.baseSize * (1 - i * 0.03),
          style.color,
          style.alpha,
          i
        );
      }

      // Draw glowing head
      const headGradient = ctx.createRadialGradient(
        currentX,
        currentY,
        0,
        currentX,
        currentY,
        style.baseSize * 2
      );

      const pulseIntensity = 0.7 + Math.sin(time * 3) * 0.3;
      headGradient.addColorStop(
        0,
        `rgba(${style.color.join(",")}, ${style.alpha * pulseIntensity})`
      );
      headGradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.fillStyle = headGradient;
      ctx.arc(currentX, currentY, style.baseSize * 1.2, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(animate);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [selectedWords.length, minWords, maxWords, segmentCount]);

  const handlePointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    // Smooth movement with light easing
    headRef.current = {
      x: headRef.current.x + (targetX - headRef.current.x) * 0.1,
      y: headRef.current.y + (targetY - headRef.current.y) * 0.1,
    };

    onMove({ x: headRef.current.x, y: headRef.current.y });
  };

  const handleWordProximity = (wordId, isClose) => {
    const currentTime = timeRef.current;

    if (isClose) {
      // Start or continue tracking interaction
      if (wordInteractionRef.current.wordId !== wordId) {
        wordInteractionRef.current = { wordId, startTime: currentTime };
      } else if (currentTime - wordInteractionRef.current.startTime >= 3) {
        // After 3 seconds of sustained interaction
        onWordInteraction(wordId, true);
        setSegmentCount((prev) => prev + 1);
        wordInteractionRef.current = { wordId: null, startTime: null };
      }
    } else if (wordInteractionRef.current.wordId === wordId) {
      // Reset if moved away from word
      wordInteractionRef.current = { wordId: null, startTime: null };
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-20 cursor-none"
      onPointerMove={handlePointerMove}
    />
  );
};

export default GrowingWordSelector;
