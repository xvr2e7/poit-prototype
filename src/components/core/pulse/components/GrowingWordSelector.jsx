import React, { useEffect, useRef } from "react";
import { perlin } from "../../../../utils/animations/animationUtils";

const TRAIL_LENGTH = 100;
const SEGMENT_SPACING = 20;
const MOUSE_GLOW_SIZE = 40;
const DAMPING = 0.92;
const ACCELERATION = 0.05;

const GrowingWordSelector = ({
  selectedWords = [],
  minWords = 5,
  maxWords = 20,
  onMove = () => {},
  onComplete = () => {},
  onStart = () => {},
  active = false,
}) => {
  const canvasRef = useRef(null);
  const positionHistoryRef = useRef([]);
  const velocityRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const activeRef = useRef(false);
  const lastClickTime = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawMouseGlow = (x, y) => {
      if (activeRef.current) return;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, MOUSE_GLOW_SIZE);
      gradient.addColorStop(0, "rgba(147, 197, 253, 0.2)");
      gradient.addColorStop(0.5, "rgba(147, 197, 253, 0.1)");
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, MOUSE_GLOW_SIZE, 0, Math.PI * 2);
      ctx.fill();
    };

    const getSegmentStyle = () => {
      const count = selectedWords.length;
      if (count < minWords) {
        return {
          color: [147, 197, 253],
          alpha: 0.8,
          baseSize: 15,
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
          baseSize: 15 + progress * 3,
        };
      } else {
        return {
          color: [245, 158, 11],
          alpha: 1,
          baseSize: 18,
        };
      }
    };

    const updatePosition = () => {
      if (!activeRef.current) return;

      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;

      velocityRef.current.x =
        velocityRef.current.x * DAMPING + dx * ACCELERATION;
      velocityRef.current.y =
        velocityRef.current.y * DAMPING + dy * ACCELERATION;

      const time = timeRef.current * 0.001;
      const driftX = perlin(time * 0.5) * 2;
      const driftY = perlin(time * 0.3 + 1000) * 2;

      currentRef.current.x += velocityRef.current.x + driftX * 0.1;
      currentRef.current.y += velocityRef.current.y + driftY * 0.1;

      positionHistoryRef.current.unshift({
        x: currentRef.current.x,
        y: currentRef.current.y,
        time: timeRef.current,
      });

      // Calculate required history based on segments (including one extra for head)
      const requiredHistory = Math.max(
        (selectedWords.length + 1) * SEGMENT_SPACING,
        TRAIL_LENGTH
      );
      if (positionHistoryRef.current.length > requiredHistory) {
        positionHistoryRef.current.pop();
      }
    };

    const drawGlowingSegment = (x, y, size, color, alpha, pulsePhase = 0) => {
      // Main glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      const glowAlpha = alpha * (0.7 + Math.sin(pulsePhase) * 0.3);

      gradient.addColorStop(0, `rgba(${color.join(",")}, ${glowAlpha})`);
      gradient.addColorStop(
        0.5,
        `rgba(${color.join(",")}, ${glowAlpha * 0.5})`
      );
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      coreGradient.addColorStop(0, `rgba(${color.join(",")}, ${alpha * 0.9})`);
      coreGradient.addColorStop(
        0.7,
        `rgba(${color.join(",")}, ${alpha * 0.4})`
      );
      coreGradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.fillStyle = coreGradient;
      ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTrail = () => {
      if (!activeRef.current || positionHistoryRef.current.length === 0) return;

      const style = getSegmentStyle();
      const time = timeRef.current * 0.001;

      // Draw body segments first (one for each selected word)
      for (let i = 0; i < selectedWords.length; i++) {
        const historyIndex = Math.floor((i + 1) * SEGMENT_SPACING); // +1 to leave space for head
        if (historyIndex >= positionHistoryRef.current.length) continue;

        const pos = positionHistoryRef.current[historyIndex];

        // Calculate wave motion
        const wavePhase = time * 2 + i * 0.2;
        const waveAmplitude = 2;

        let angle = 0;
        if (historyIndex + 1 < positionHistoryRef.current.length) {
          const nextPos = positionHistoryRef.current[historyIndex + 1];
          angle = Math.atan2(pos.y - nextPos.y, pos.x - nextPos.x);
        }

        // Apply wave motion
        const wavePosX =
          pos.x +
          Math.cos(angle + Math.PI / 2) * Math.sin(wavePhase) * waveAmplitude;
        const wavePosY =
          pos.y +
          Math.sin(angle + Math.PI / 2) * Math.sin(wavePhase) * waveAmplitude;

        // Calculate segment properties
        const segmentSize = style.baseSize * (1 - i * 0.03);
        const segmentAlpha = Math.max(0.2, style.alpha - i * 0.02);
        const pulsePhase = time * 3 + i * 0.2;

        drawGlowingSegment(
          wavePosX,
          wavePosY,
          segmentSize,
          style.color,
          segmentAlpha,
          pulsePhase
        );
      }

      // Always draw head last (on top)
      const headPos = positionHistoryRef.current[0];
      drawGlowingSegment(
        headPos.x,
        headPos.y,
        style.baseSize * 1.2,
        style.color,
        style.alpha,
        time * 3
      );
    };

    const animate = () => {
      timeRef.current = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updatePosition();
      drawTrail();
      drawMouseGlow(targetRef.current.x, targetRef.current.y);
      requestAnimationFrame(animate);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [selectedWords.length, minWords, maxWords]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const handlePointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    targetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (activeRef.current) {
      onMove(targetRef.current);
    }
  };

  const handleClick = (e) => {
    const now = performance.now();
    const rect = canvasRef.current.getBoundingClientRect();

    if (!activeRef.current) {
      // Initialize position at click location
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      currentRef.current = { x, y };
      targetRef.current = { x, y };
      velocityRef.current = { x: 0, y: 0 };
      positionHistoryRef.current = [{ x, y, time: now }];

      onStart();
    } else if (
      selectedWords.length >= minWords &&
      now - lastClickTime.current < 300
    ) {
      onComplete();
    }

    lastClickTime.current = now;
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-20 cursor-none"
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    />
  );
};

export default GrowingWordSelector;
