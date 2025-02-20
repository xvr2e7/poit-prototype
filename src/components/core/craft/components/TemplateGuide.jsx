import React, { useEffect, useRef } from "react";

const TemplateGuide = ({
  template,
  isActive = false,
  onHover = () => {},
  className = "",
}) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const timeRef = useRef(0);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !template) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    const setupCanvas = () => {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);

      canvas.logicalWidth = rect.width;
      canvas.logicalHeight = rect.height;

      ctx.textRendering = "optimizeLegibility";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas.parentElement) {
          setupCanvas();
        }
      }
    });

    resizeObserverRef.current.observe(canvas.parentElement);
    setupCanvas();

    const getTemplateLayout = () => {
      const width = canvas.logicalWidth;
      const height = canvas.logicalHeight;
      const minDimension = Math.min(width, height);
      const margin = minDimension * 0.1; // 10% margin
      const lineHeight = Math.min(36, minDimension * 0.05);
      const lineSpacing = lineHeight * 0.4;

      switch (template) {
        case "sonnet":
          return {
            lines: Array(14)
              .fill()
              .map((_, i) => ({
                x: margin,
                y: margin + i * (lineHeight + lineSpacing),
                width: width - margin * 2,
                height: lineHeight,
                isVolta: i === 8,
                group: i < 8 ? "octave" : "sestet",
              })),
            info: {
              title: "Sonnet",
              description: "A 14-line poem with a turn (volta) after line 8",
            },
            margin,
          };
        case "haiku":
          const totalHeight = height - margin * 2;
          const spacing = totalHeight / 4;
          return {
            lines: [
              {
                x: margin,
                y: margin + spacing,
                width: width * 0.4,
                height: lineHeight,
                syllables: 5,
              },
              {
                x: margin,
                y: margin + spacing * 2,
                width: width * 0.5,
                height: lineHeight,
                syllables: 7,
              },
              {
                x: margin,
                y: margin + spacing * 3,
                width: width * 0.4,
                height: lineHeight,
                syllables: 5,
              },
            ],
            info: {
              title: "Haiku",
              description: "Three lines in 5-7-5 syllable pattern",
            },
            margin,
          };
        case "lushi":
          return {
            lines: Array(8)
              .fill()
              .map((_, i) => ({
                x: margin,
                y: margin + i * (lineHeight + lineSpacing),
                width: width - margin * 2,
                height: lineHeight,
                group: Math.floor(i / 2),
                isParallel: i >= 2 && i < 6,
              })),
            info: {
              title: "Lüshi",
              description: "Eight lines with parallel couplets in the middle",
            },
            margin,
          };
        default:
          return { lines: [], info: { title: "", description: "" }, margin };
      }
    };

    const draw = () => {
      const { lines, info } = getTemplateLayout();

      ctx.clearRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);

      ctx.font = "bold 16px -apple-system, system-ui, sans-serif";
      ctx.fillStyle = "#2C8C7C";
      ctx.fillText(info.title, 20, 30);

      ctx.font = "14px -apple-system, system-ui, sans-serif";
      ctx.fillStyle = "rgba(44, 140, 124, 0.8)";
      ctx.fillText(info.description, 20, 50);

      lines.forEach((line, i) => {
        const yOffset = Math.sin(timeRef.current + i * 0.5) * 0.5;

        ctx.fillStyle = "rgba(44, 140, 124, 0.03)";
        ctx.fillRect(line.x, line.y + yOffset, line.width, line.height);

        ctx.strokeStyle = "rgba(44, 140, 124, 0.15)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.strokeRect(line.x, line.y + yOffset, line.width, line.height);

        // Draw line-specific indicators based on template type
        if (line.syllables) {
          // For Haiku: show syllable counts
          ctx.font = "12px monospace";
          ctx.fillStyle = "rgba(44, 140, 124, 0.4)";
          ctx.fillText(
            `${line.syllables}`,
            line.x - 20,
            line.y + line.height / 2 + yOffset
          );
        } else if (line.isVolta) {
          // For Sonnet: show volta
          ctx.font = "12px monospace";
          ctx.fillStyle = "rgba(44, 140, 124, 0.4)";
          ctx.fillText(
            "volta",
            line.x - 35,
            line.y + line.height / 2 + yOffset
          );
        } else if (line.isParallel) {
          // For Lüshi: show parallel indicators
          ctx.fillStyle = "rgba(44, 140, 124, 0.4)";
          ctx.fillRect(line.x - 8, line.y + yOffset, 2, line.height);
        }

        // Draw couplet/group indicators if present
        if (line.group !== undefined) {
          const groupColor = line.isParallel
            ? "rgba(44, 140, 124, 0.3)"
            : "rgba(44, 140, 124, 0.15)";

          ctx.fillStyle = groupColor;
          ctx.fillRect(line.x - 8, line.y + yOffset, 2, line.height);
        }
      });

      timeRef.current += 0.001;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [template, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    />
  );
};

export default TemplateGuide;
