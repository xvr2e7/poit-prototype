import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const particleSystemsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles with depth layers
    const createParticleSystems = () => {
      const layers = [
        { count: 10, speedRange: [0.3, 0.5], sizeRange: [2, 3], opacity: 0.8 }, // Foreground
        {
          count: 15,
          speedRange: [0.15, 0.25],
          sizeRange: [1.5, 2.5],
          opacity: 0.6,
        }, // Midground
        {
          count: 25,
          speedRange: [0.05, 0.15],
          sizeRange: [0.5, 1.5],
          opacity: 0.4,
        }, // Background
      ];

      particleSystemsRef.current = layers.map((layer) =>
        Array.from({ length: layer.count }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          angle: Math.random() * Math.PI * 2,
          speed:
            layer.speedRange[0] +
            Math.random() * (layer.speedRange[1] - layer.speedRange[0]),
          size:
            layer.sizeRange[0] +
            Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
          opacity: layer.opacity * (0.8 + Math.random() * 0.4),
          frequency: 0.0005 + Math.random() * 0.001,
        }))
      );
    };

    createParticleSystems();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticleSystems();
    };

    window.addEventListener("resize", handleResize);

    // Animation loop with optimized rendering
    const animate = (timestamp) => {
      ctx.fillStyle = "#0a1525";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw caustic light patterns
      const drawCaustics = () => {
        const time = timestamp * 0.0001;
        const gradientSize = Math.min(canvas.width, canvas.height) * 1.5;

        // Subtle shifting light rays
        const centerX = canvas.width / 2 + Math.sin(time * 0.5) * 50;
        const centerY = -100 + Math.sin(time * 0.3) * 30;

        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          gradientSize
        );
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.08)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add subtle caustic patterns
        for (let i = 0; i < 3; i++) {
          const x = canvas.width / 2 + Math.sin(time + i * 2) * 100;
          const y = canvas.height / 3 + Math.cos(time + i) * 50;

          const causticGradient = ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            200 + Math.sin(time + i) * 50
          );
          causticGradient.addColorStop(0, "rgba(56, 189, 248, 0.02)");
          causticGradient.addColorStop(1, "transparent");
          ctx.fillStyle = causticGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };

      drawCaustics();

      // Update and draw particles with depth effect
      particleSystemsRef.current.forEach((particles) => {
        particles.forEach((particle) => {
          // Organic movement pattern
          particle.angle += Math.sin(timestamp * particle.frequency) * 0.02;
          particle.x += Math.cos(particle.angle) * particle.speed;
          particle.y += Math.sin(particle.angle) * particle.speed;

          // Smooth wrapping
          if (particle.x > canvas.width + particle.size)
            particle.x = -particle.size;
          if (particle.x < -particle.size)
            particle.x = canvas.width + particle.size;
          if (particle.y > canvas.height + particle.size)
            particle.y = -particle.size;
          if (particle.y < -particle.size)
            particle.y = canvas.height + particle.size;

          // Draw particle with glow effect
          ctx.beginPath();
          const glow = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 3
          );
          glow.addColorStop(0, `rgba(147, 197, 253, ${particle.opacity})`);
          glow.addColorStop(
            0.6,
            `rgba(147, 197, 253, ${particle.opacity * 0.3})`
          );
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ backgroundColor: "#0a1525" }}
      />

      {/* Ambient depth gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-blue-950/20" />
      </div>
    </>
  );
};

export default AnimatedBackground;
