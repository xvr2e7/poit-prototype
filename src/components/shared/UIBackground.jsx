import React, { useEffect, useRef } from "react";

const PRESETS = {
  pulse: {
    // active and engaging
    particles: {
      deep: {
        count: 25,
        speedRange: [0.02, 0.06],
        sizeRange: [3, 6],
        opacity: [0.15, 0.3],
        colorStop: [147, 197, 253],
        pulseSpeed: [0.0003, 0.0008],
        pulseRange: [0.6, 1],
      },
      mid: {
        count: 35,
        speedRange: [0.04, 0.1],
        sizeRange: [1.8, 4.2],
        opacity: [0.2, 0.45],
        colorStop: [167, 207, 253],
        pulseSpeed: [0.0005, 0.001],
        pulseRange: [0.7, 1],
      },
      surface: {
        count: 20,
        speedRange: [0.08, 0.15],
        sizeRange: [1, 2.5],
        opacity: [0.3, 0.5],
        colorStop: [187, 217, 253],
        pulseSpeed: [0.0008, 0.0015],
        pulseRange: [0.8, 1],
      },
      micro: {
        count: 45,
        speedRange: [0.1, 0.2],
        sizeRange: [0.5, 1.5],
        opacity: [0.2, 0.4],
        colorStop: [207, 227, 253],
        pulseSpeed: [0.001, 0.002],
        pulseRange: [0.9, 1],
      },
    },
    caustics: {
      primary: {
        count: 5,
        opacityRange: [0.02, 0.03],
        sizeRange: [300, 400],
        speed: 0.0001,
      },
      secondary: {
        count: 3,
        opacityRange: [0.01, 0.02],
        sizeRange: [400, 500],
        speed: 0.00008,
      },
    },
    rayPenetration: {
      intensity: 0.15,
      speed: 0.00007,
      count: 3,
    },
    deepGlow: {
      stops: [
        { stop: 0, color: "rgba(7, 89, 133, 0.15)" },
        { stop: 0.5, color: "rgba(12, 74, 110, 0.1)" },
        { stop: 1, color: "rgba(8, 47, 73, 0.05)" },
      ],
    },
  },
  craft: {
    // contemplative and focused
    particles: {
      deep: {
        count: 30,
        speedRange: [0.02, 0.05],
        sizeRange: [3.5, 7],
        opacity: [0.12, 0.25],
        colorStop: [147, 197, 253],
        pulseSpeed: [0.0002, 0.0006],
        pulseRange: [0.7, 1],
      },
      mid: {
        count: 40,
        speedRange: [0.03, 0.08],
        sizeRange: [2, 4.5],
        opacity: [0.15, 0.35],
        colorStop: [167, 207, 253],
        pulseSpeed: [0.0004, 0.0009],
        pulseRange: [0.8, 1],
      },
      surface: {
        count: 25,
        speedRange: [0.06, 0.12],
        sizeRange: [1.2, 2.8],
        opacity: [0.2, 0.4],
        colorStop: [187, 217, 253],
        pulseSpeed: [0.0006, 0.0012],
        pulseRange: [0.85, 1],
      },
      micro: {
        count: 50,
        speedRange: [0.08, 0.15],
        sizeRange: [0.6, 1.8],
        opacity: [0.15, 0.35],
        colorStop: [207, 227, 253],
        pulseSpeed: [0.0008, 0.0015],
        pulseRange: [0.9, 1],
      },
    },
    caustics: {
      primary: {
        count: 5,
        opacityRange: [0.015, 0.025],
        sizeRange: [300, 400],
        speed: 0.00008,
      },
      secondary: {
        count: 3,
        opacityRange: [0.01, 0.015],
        sizeRange: [400, 500],
        speed: 0.00006,
      },
    },
    rayPenetration: {
      intensity: 0.12,
      speed: 0.00006,
      count: 3,
    },
    deepGlow: {
      stops: [
        { stop: 0, color: "rgba(7, 89, 133, 0.12)" },
        { stop: 0.5, color: "rgba(12, 74, 110, 0.08)" },
        { stop: 1, color: "rgba(8, 47, 73, 0.04)" },
      ],
    },
  },
  echo: {
    // dreamy and expansive
    particles: {
      deep: {
        count: 35,
        speedRange: [0.015, 0.04],
        sizeRange: [4, 8],
        opacity: [0.1, 0.2],
        colorStop: [147, 197, 253],
        pulseSpeed: [0.0001, 0.0005],
        pulseRange: [0.8, 1],
      },
      mid: {
        count: 45,
        speedRange: [0.025, 0.07],
        sizeRange: [2.2, 5],
        opacity: [0.12, 0.3],
        colorStop: [167, 207, 253],
        pulseSpeed: [0.0003, 0.0007],
        pulseRange: [0.85, 1],
      },
      surface: {
        count: 30,
        speedRange: [0.04, 0.1],
        sizeRange: [1.4, 3],
        opacity: [0.15, 0.35],
        colorStop: [187, 217, 253],
        pulseSpeed: [0.0005, 0.001],
        pulseRange: [0.9, 1],
      },
      micro: {
        count: 55,
        speedRange: [0.06, 0.12],
        sizeRange: [0.7, 2],
        opacity: [0.1, 0.3],
        colorStop: [207, 227, 253],
        pulseSpeed: [0.0007, 0.0013],
        pulseRange: [0.95, 1],
      },
    },
    caustics: {
      primary: {
        count: 5,
        opacityRange: [0.01, 0.02],
        sizeRange: [300, 400],
        speed: 0.00006,
      },
      secondary: {
        count: 3,
        opacityRange: [0.008, 0.012],
        sizeRange: [400, 500],
        speed: 0.00004,
      },
    },
    rayPenetration: {
      intensity: 0.1,
      speed: 0.00005,
      count: 3,
    },
    deepGlow: {
      stops: [
        { stop: 0, color: "rgba(7, 89, 133, 0.1)" },
        { stop: 0.5, color: "rgba(12, 74, 110, 0.06)" },
        { stop: 1, color: "rgba(8, 47, 73, 0.03)" },
      ],
    },
  },
};

const UIBackground = ({ mode = "pulse", intensity = 1, className = "" }) => {
  const canvasRef = useRef(null);
  const particleSystemsRef = useRef([]);
  const causticsRef = useRef({ primary: [], secondary: [] });
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const config = PRESETS[mode];

    const createParticleSystems = () => {
      const createLayer = (layerConfig, depth) => {
        return Array.from({ length: layerConfig.count }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size:
            layerConfig.sizeRange[0] +
            Math.random() *
              (layerConfig.sizeRange[1] - layerConfig.sizeRange[0]),
          speed:
            layerConfig.speedRange[0] +
            Math.random() *
              (layerConfig.speedRange[1] - layerConfig.speedRange[0]),
          angle: Math.random() * Math.PI * 2,
          baseOpacity:
            layerConfig.opacity[0] +
            Math.random() * (layerConfig.opacity[1] - layerConfig.opacity[0]),
          depth,
          frequency:
            layerConfig.pulseSpeed[0] +
            Math.random() *
              (layerConfig.pulseSpeed[1] - layerConfig.pulseSpeed[0]),
          pulseRange:
            layerConfig.pulseRange[0] +
            Math.random() *
              (layerConfig.pulseRange[1] - layerConfig.pulseRange[0]),
          colorStop: [...layerConfig.colorStop],
          phaseOffset: Math.random() * Math.PI * 2, // Add this line
        }));
      };

      particleSystemsRef.current = [
        createLayer(config.particles.deep, 4),
        createLayer(config.particles.mid, 3),
        createLayer(config.particles.surface, 2),
        createLayer(config.particles.micro, 1),
      ];

      ["primary", "secondary"].forEach((type) => {
        const causticConfig = config.caustics[type];
        causticsRef.current[type] = Array.from(
          { length: causticConfig.count },
          () => ({
            x: Math.random() * canvas.width,
            y: -100 + Math.random() * 200,
            size:
              causticConfig.sizeRange[0] +
              Math.random() *
                (causticConfig.sizeRange[1] - causticConfig.sizeRange[0]),
            speed: 0.15 + Math.random() * 0.25,
            opacity:
              causticConfig.opacityRange[0] +
              Math.random() *
                (causticConfig.opacityRange[1] - causticConfig.opacityRange[0]),
            phaseOffset: Math.random() * Math.PI * 2,
          })
        );
      });
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticleSystems();
    };

    const drawCaustics = (timestamp) => {
      Object.entries(causticsRef.current).forEach(([type, caustics]) => {
        caustics.forEach((caustic) => {
          const time = timestamp * (config.caustics[type]?.speed || 0.0001);
          const x = caustic.x + Math.sin(time + caustic.phaseOffset) * 40;
          const y = caustic.y + Math.cos(time * 0.6 + caustic.phaseOffset) * 25;

          const gradient = ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            caustic.size
          );
          const opacity = Math.max(0, Math.min(1, caustic.opacity * intensity));
          gradient.addColorStop(0, `rgba(56, 189, 248, ${opacity})`);
          gradient.addColorStop(0.5, `rgba(56, 189, 248, ${opacity * 0.4})`);
          gradient.addColorStop(1, "rgba(56, 189, 248, 0)");

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
      });
    };

    const drawDeepGlow = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      config.deepGlow?.stops?.forEach(({ stop, color }) => {
        gradient.addColorStop(stop, color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAndDrawParticles = (timestamp) => {
      particleSystemsRef.current.forEach((layer) => {
        layer.forEach((particle) => {
          particle.angle += Math.sin(timestamp * particle.frequency) * 0.015;
          particle.x += Math.cos(particle.angle) * particle.speed;
          particle.y += Math.sin(particle.angle) * particle.speed;

          // Screen wrapping
          if (particle.x < -particle.size)
            particle.x = canvas.width + particle.size;
          if (particle.x > canvas.width + particle.size)
            particle.x = -particle.size;
          if (particle.y < -particle.size)
            particle.y = canvas.height + particle.size;
          if (particle.y > canvas.height + particle.size)
            particle.y = -particle.size;

          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * (4 - particle.depth)
          );

          const pulsePhase =
            timestamp * particle.frequency + particle.phaseOffset;
          const oscilation = Math.sin(pulsePhase) * (1 - particle.pulseRange);
          const modifiedOpacity = Math.max(
            0,
            Math.min(
              1,
              particle.baseOpacity *
                (1.2 - particle.depth * 0.2) *
                intensity *
                (0.8 + oscilation)
            )
          );

          const [r, g, b] = particle.colorStop;
          gradient.addColorStop(
            0,
            `rgba(${r}, ${g}, ${b}, ${modifiedOpacity})`
          );
          gradient.addColorStop(
            0.5,
            `rgba(${r}, ${g}, ${b}, ${modifiedOpacity * 0.4})`
          );
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(
            particle.x,
            particle.y,
            particle.size * (4 - particle.depth),
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      });
    };

    const animate = (timestamp) => {
      ctx.fillStyle = "#0a1525";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawDeepGlow();
      drawCaustics(timestamp);
      updateAndDrawParticles(timestamp);

      animationRef.current = requestAnimationFrame(animate);
    };

    createParticleSystems();
    window.addEventListener("resize", handleResize);
    animate(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full ${className}`}
      style={{ backgroundColor: "#0a1525" }}
    />
  );
};

export default UIBackground;
