import React, { useEffect, useRef } from "react";

const PulseBackground = () => {
  const canvasRef = useRef(null);
  const particleSystemsRef = useRef([]);
  const causticPatternsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create layered particle systems with depth
    const createParticleSystems = () => {
      // Deep background particles (slowest, largest, most transparent)
      const deepLayer = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.random() * 3,
        speed: 0.05 + Math.random() * 0.1,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.2,
        depth: 3,
        frequency: 0.0002 + Math.random() * 0.0003,
      }));

      // Mid-layer particles
      const midLayer = Array.from({ length: 20 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1.5 + Math.random() * 2,
        speed: 0.1 + Math.random() * 0.15,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.2,
        depth: 2,
        frequency: 0.0003 + Math.random() * 0.0004,
      }));

      // Surface layer particles (fastest, smallest, brightest)
      const surfaceLayer = Array.from({ length: 15 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 1.5,
        speed: 0.15 + Math.random() * 0.2,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.4 + Math.random() * 0.2,
        depth: 1,
        frequency: 0.0004 + Math.random() * 0.0005,
      }));

      particleSystemsRef.current = [deepLayer, midLayer, surfaceLayer];

      // Create caustic light patterns
      causticPatternsRef.current = Array.from({ length: 5 }, () => ({
        x: Math.random() * canvas.width,
        y: -100 + Math.random() * 200,
        size: 300 + Math.random() * 400,
        speed: 0.2 + Math.random() * 0.3,
        opacity: 0.02 + Math.random() * 0.03,
      }));
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticleSystems();
    };

    window.addEventListener("resize", handleResize);
    createParticleSystems();

    const drawCaustics = (timestamp) => {
      causticPatternsRef.current.forEach((caustic) => {
        const time = timestamp * 0.0001;
        const x = caustic.x + Math.sin(time) * 50;
        const y = caustic.y + Math.cos(time * 0.7) * 30;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, caustic.size);

        gradient.addColorStop(0, `rgba(56, 189, 248, ${caustic.opacity})`);
        gradient.addColorStop(
          0.5,
          `rgba(56, 189, 248, ${caustic.opacity * 0.5})`
        );
        gradient.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    };

    const drawDeepGlow = () => {
      // Create deep water ambient glow
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(7, 89, 133, 0.15)");
      gradient.addColorStop(0.5, "rgba(12, 74, 110, 0.1)");
      gradient.addColorStop(1, "rgba(8, 47, 73, 0.05)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = (timestamp) => {
      ctx.fillStyle = "#0a1525";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw deep water ambient effect
      drawDeepGlow();

      // Draw caustic light patterns
      drawCaustics(timestamp);

      // Update and draw particles with depth effects
      particleSystemsRef.current.forEach((layer) => {
        layer.forEach((particle) => {
          // Update position with smooth movement
          particle.angle += Math.sin(timestamp * particle.frequency) * 0.02;
          particle.x += Math.cos(particle.angle) * particle.speed;
          particle.y += Math.sin(particle.angle) * particle.speed;

          // Wrap around screen
          if (particle.x < -particle.size)
            particle.x = canvas.width + particle.size;
          if (particle.x > canvas.width + particle.size)
            particle.x = -particle.size;
          if (particle.y < -particle.size)
            particle.y = canvas.height + particle.size;
          if (particle.y > canvas.height + particle.size)
            particle.y = -particle.size;

          // Create particle glow with depth effect
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * (4 - particle.depth)
          );

          const baseOpacity = particle.opacity * (1.2 - particle.depth * 0.2);
          gradient.addColorStop(0, `rgba(147, 197, 253, ${baseOpacity})`);
          gradient.addColorStop(
            0.5,
            `rgba(147, 197, 253, ${baseOpacity * 0.5})`
          );
          gradient.addColorStop(1, "rgba(147, 197, 253, 0)");

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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ backgroundColor: "#0a1525" }}
    />
  );
};

export default PulseBackground;
