import React, { useEffect, useRef } from "react";

const TemplateGuide = ({ template, isActive = false, className = "" }) => {
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
      if (!container) return;

      const rect = container.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);

      // Store logical dimensions as regular properties, not trying to add to canvas
      canvas.setAttribute("data-logical-width", rect.width);
      canvas.setAttribute("data-logical-height", rect.height);
    };

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas.parentElement) {
          setupCanvas();
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserverRef.current.observe(canvas.parentElement);
    }

    setupCanvas();

    const getTemplateLayout = () => {
      const width = parseFloat(
        canvas.getAttribute("data-logical-width") || canvas.width
      );
      const height = parseFloat(
        canvas.getAttribute("data-logical-height") || canvas.height
      );
      const minDimension = Math.min(width, height);
      const margin = minDimension * 0.1; // 10% margin
      const lineHeight = Math.min(30, minDimension * 0.04);
      const lineSpacing = lineHeight * 0.8;

      // Colors
      const lineColor = "rgba(44, 140, 124, 0.15)";
      const fillColor = "rgba(44, 140, 124, 0.03)";
      const accentColor = "rgba(44, 140, 124, 0.2)";
      const textColor = "rgba(44, 140, 124, 0.6)";
      const titleColor = "rgba(44, 140, 124, 0.7)";

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
                group: i < 8 ? 1 : 2,
              })),
            info: {
              title: "Sonnet",
              description: "14 lines (8+6)",
            },
          };
        case "haiku":
          return {
            lines: [
              {
                x: margin,
                y: margin + height * 0.2,
                width: width * 0.5,
                height: lineHeight,
                syllables: 5,
              },
              {
                x: margin,
                y: margin + height * 0.4,
                width: width * 0.6,
                height: lineHeight,
                syllables: 7,
              },
              {
                x: margin,
                y: margin + height * 0.6,
                width: width * 0.5,
                height: lineHeight,
                syllables: 5,
              },
            ],
            info: {
              title: "Haiku",
              description: "3 lines (5-7-5)",
            },
          };
        case "limerick":
          return {
            lines: [
              {
                x: margin,
                y: margin + 0 * (lineHeight + lineSpacing),
                width: width * 0.6,
                height: lineHeight,
                rhyme: "A",
              },
              {
                x: margin,
                y: margin + 1 * (lineHeight + lineSpacing),
                width: width * 0.6,
                height: lineHeight,
                rhyme: "A",
              },
              {
                x: margin + width * 0.05,
                y: margin + 2 * (lineHeight + lineSpacing),
                width: width * 0.5,
                height: lineHeight,
                rhyme: "B",
              },
              {
                x: margin + width * 0.05,
                y: margin + 3 * (lineHeight + lineSpacing),
                width: width * 0.5,
                height: lineHeight,
                rhyme: "B",
              },
              {
                x: margin,
                y: margin + 4 * (lineHeight + lineSpacing),
                width: width * 0.6,
                height: lineHeight,
                rhyme: "A",
              },
            ],
            info: {
              title: "Limerick",
              description: "5 lines (AABBA)",
            },
          };
        case "tanka":
          return {
            lines: [
              {
                x: margin,
                y: margin + 0 * (lineHeight + lineSpacing),
                width: width * 0.5,
                height: lineHeight,
                syllables: 5,
              },
              {
                x: margin,
                y: margin + 1 * (lineHeight + lineSpacing),
                width: width * 0.6,
                height: lineHeight,
                syllables: 7,
              },
              {
                x: margin,
                y: margin + 2 * (lineHeight + lineSpacing),
                width: width * 0.5,
                height: lineHeight,
                syllables: 5,
              },
              {
                x: margin,
                y: margin + 3 * (lineHeight + lineSpacing),
                width: width * 0.6,
                height: lineHeight,
                syllables: 7,
              },
              {
                x: margin,
                y: margin + 4 * (lineHeight + lineSpacing),
                width: width * 0.6,
                height: lineHeight,
                syllables: 7,
              },
            ],
            info: {
              title: "Tanka",
              description: "5 lines (5-7-5-7-7)",
            },
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
                isParallel: i >= 2 && i < 6,
                group: Math.floor(i / 2),
              })),
            info: {
              title: "Lüshi",
              description: "8 lines with parallel couplets",
            },
          };
        case "ghazal":
          const coupletCount = 5;
          return {
            lines: Array(coupletCount * 2)
              .fill()
              .map((_, i) => ({
                x: margin,
                y: margin + i * (lineHeight + lineSpacing),
                width: width - margin * 2,
                height: lineHeight,
                isRefrain: i % 2 === 1, // Every second line has the refrain
                isMatlaa: i < 2, // First couplet has both lines ending with refrain
              })),
            info: {
              title: "Ghazal",
              description: "5 couplets with refrain",
            },
          };
        default:
          return { lines: [], info: { title: "", description: "" }, margin };
      }
    };

    const draw = () => {
      if (!ctx) return;

      const layout = getTemplateLayout();
      const { lines, info } = layout;
      const width = parseFloat(
        canvas.getAttribute("data-logical-width") || canvas.width
      );
      const height = parseFloat(
        canvas.getAttribute("data-logical-height") || canvas.height
      );
      const minDimension = Math.min(width, height);
      const margin = minDimension * 0.1;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw template title
      ctx.fillStyle = "rgba(44, 140, 124, 0.7)";
      ctx.font = "bold 20px -apple-system, system-ui, sans-serif";
      ctx.fillText(info.title, 20, 35);

      // Draw subtitle/description
      ctx.fillStyle = "rgba(44, 140, 124, 0.5)";
      ctx.font = "14px -apple-system, system-ui, sans-serif";
      ctx.fillText(info.description, 20, 60);

      // Draw the lines - simple boxes for each line/row
      lines.forEach((line, i) => {
        const yOffset = Math.sin(timeRef.current + i * 0.5) * 0.5;

        // Fill background
        ctx.fillStyle = "rgba(44, 140, 124, 0.03)";
        ctx.fillRect(line.x, line.y + yOffset, line.width, line.height);

        // Draw border
        ctx.strokeStyle = "rgba(44, 140, 124, 0.15)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.strokeRect(line.x, line.y + yOffset, line.width, line.height);
      });

      // Add specific template details
      if (template === "sonnet") {
        // Draw division between octave and sestet
        const voltaY =
          margin +
          8 * (lines[0].height + (lines[1].y - lines[0].y - lines[0].height)) -
          (lines[1].y - lines[0].y - lines[0].height) / 2;
        ctx.fillStyle = "rgba(44, 140, 124, 0.2)";
        ctx.fillRect(margin, voltaY, width - margin * 2, 1);

        // Label octave and sestet
        ctx.fillStyle = "rgba(44, 140, 124, 0.6)";
        ctx.font = "12px -apple-system, system-ui, sans-serif";
        ctx.fillText("Octave", margin, margin - 10);
        ctx.fillText("Sestet", margin, voltaY + 15);

        // Indicate rhyme scheme
        const rhymeScheme = [
          "A",
          "B",
          "A",
          "B",
          "A",
          "B",
          "A",
          "B",
          "C",
          "D",
          "C",
          "D",
          "C",
          "D",
        ];
        rhymeScheme.forEach((rhyme, i) => {
          if (i >= lines.length) return;
          const y = lines[i].y + lines[i].height / 2;

          ctx.fillStyle = "rgba(44, 140, 124, 0.6)";
          ctx.font = "10px -apple-system, system-ui, sans-serif";
          ctx.fillText(rhyme, width - margin + 10, y);
        });
      } else if (template === "haiku") {
        // Draw syllable counts
        ctx.fillStyle = "rgba(44, 140, 124, 0.6)";
        ctx.font = "12px -apple-system, system-ui, sans-serif";

        lines.forEach((line, i) => {
          if (line.syllables) {
            ctx.fillText(
              line.syllables.toString(),
              width - margin + 10,
              line.y + line.height / 2
            );
          }
        });
      } else if (template === "limerick") {
        // Draw rhyme scheme
        ctx.fillStyle = "rgba(44, 140, 124, 0.6)";
        ctx.font = "12px -apple-system, system-ui, sans-serif";

        const rhymes = ["A", "A", "B", "B", "A"];
        rhymes.forEach((rhyme, i) => {
          if (i >= lines.length) return;
          const y = lines[i].y + lines[i].height / 2;
          ctx.fillText(rhyme, width - margin + 10, y);
        });
      } else if (template === "tanka") {
        // Draw syllable counts
        ctx.fillStyle = "rgba(44, 140, 124, 0.6)";
        ctx.font = "12px -apple-system, system-ui, sans-serif";

        const syllables = [5, 7, 5, 7, 7];
        syllables.forEach((count, i) => {
          if (i >= lines.length) return;
          const y = lines[i].y + lines[i].height / 2;
          ctx.fillText(count.toString(), width - margin + 10, y);
        });

        // Show the connection to haiku in the first 3 lines
        ctx.fillStyle = "rgba(44, 140, 124, 0.2)";
        ctx.fillRect(
          margin - 8,
          margin,
          2,
          3 * (lines[1].y - lines[0].y) -
            (lines[1].y - lines[0].y - lines[0].height)
        );

        // Label sections
        ctx.fillStyle = "rgba(44, 140, 124, 0.6)";
        ctx.font = "12px -apple-system, system-ui, sans-serif";
        const haikuMiddle = margin + 1.5 * (lines[1].y - lines[0].y);
        ctx.fillText("Haiku", margin - 50, haikuMiddle);

        const coupletMiddle = margin + 3.5 * (lines[1].y - lines[0].y);
        ctx.fillText("Couplet", margin - 50, coupletMiddle);
      } else if (template === "lushi") {
        // Draw couplet groupings
        for (let i = 0; i < 4; i++) {
          if (i * 2 >= lines.length) continue;

          const startY = lines[i * 2].y;
          const endY =
            i * 2 + 1 < lines.length
              ? lines[i * 2 + 1].y + lines[i * 2 + 1].height
              : startY + lines[i * 2].height;

          // Draw bracket for each couplet
          ctx.strokeStyle = "rgba(44, 140, 124, 0.2)";
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(margin - 8, startY);
          ctx.lineTo(margin - 12, startY);
          ctx.lineTo(margin - 12, endY);
          ctx.lineTo(margin - 8, endY);
          ctx.stroke();
        }

        // Highlight parallel couplets in the middle
        if (lines.length >= 6) {
          const startY = lines[2].y;
          const endY = lines[5].y + lines[5].height;

          ctx.fillStyle = "rgba(44, 140, 124, 0.2)";
          ctx.fillRect(margin - 20, startY, 3, endY - startY);

          // Label the sections
          ctx.fillStyle = "rgba(44, 140, 124, 0.6)";
          ctx.font = "12px -apple-system, system-ui, sans-serif";

          ctx.fillText(
            "Opening",
            margin - 70,
            margin + 1 * (lines[1].y - lines[0].y)
          );
          ctx.fillText(
            "Parallel",
            margin - 70,
            margin + 3.5 * (lines[1].y - lines[0].y)
          );
          ctx.fillText(
            "Closing",
            margin - 70,
            margin + 7 * (lines[1].y - lines[0].y)
          );
        }
      } else if (template === "ghazal") {
        if (lines.length > 0) {
          const coupletCount = Math.floor(lines.length / 2);
          // Draw couplet groupings
          for (let i = 0; i < coupletCount; i++) {
            if (i * 2 >= lines.length) continue;

            const startY = lines[i * 2].y;
            const endY =
              i * 2 + 1 < lines.length
                ? lines[i * 2 + 1].y + lines[i * 2 + 1].height
                : startY + lines[i * 2].height;

            // Draw bracket for each couplet
            ctx.strokeStyle = "rgba(44, 140, 124, 0.2)";
            ctx.lineWidth = 1;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(margin - 8, startY);
            ctx.lineTo(margin - 12, startY);
            ctx.lineTo(margin - 12, endY);
            ctx.lineTo(margin - 8, endY);
            ctx.stroke();
          }

          // Draw refrain indicators
          for (let i = 0; i < coupletCount; i++) {
            // First couplet - both lines have refrain
            if (i === 0 && lines.length >= 2) {
              ctx.fillStyle = "rgba(44, 140, 124, 0.2)";
              ctx.fillRect(
                width - margin - 40,
                lines[0].y + lines[0].height / 2 - 2,
                30,
                4
              );
              ctx.fillRect(
                width - margin - 40,
                lines[1].y + lines[1].height / 2 - 2,
                30,
                4
              );
            } else if (i * 2 + 1 < lines.length) {
              // Other couplets - only second line has refrain
              ctx.fillStyle = "rgba(44, 140, 124, 0.2)";
              ctx.fillRect(
                width - margin - 40,
                lines[i * 2 + 1].y + lines[i * 2 + 1].height / 2 - 2,
                30,
                4
              );
            }
          }

          // Label sections
          ctx.fillStyle = "rgba(44, 140, 124, 0.6)";
          ctx.font = "12px -apple-system, system-ui, sans-serif";
          ctx.fillText("Matlaa", margin - 50, lines[0].y + lines[0].height);
          ctx.fillText(
            "Refrains →",
            width - margin - 90,
            lines[0].y + lines[0].height / 2
          );
        }
      }

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
      className={`absolute inset-0 ${className} pointer-events-none`}
      style={{
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    />
  );
};

export default TemplateGuide;
