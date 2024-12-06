import React, { useEffect, useRef } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const particleSystemsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create layered particle systems for depth effect
    const createParticleSystems = () => {
      const layers = [
        {
          count: 10,
          speedRange: [0.3, 0.5],
          sizeRange: [2, 3],
          opacity: 0.8,
          depth: 1,
        }, // Foreground
        {
          count: 15,
          speedRange: [0.15, 0.25],
          sizeRange: [1.5, 2.5],
          opacity: 0.6,
          depth: 2,
        }, // Midground
        {
          count: 25,
          speedRange: [0.05, 0.15],
          sizeRange: [0.5, 1.5],
          opacity: 0.4,
          depth: 3,
        }, // Background
      ];

      particleSystemsRef.current = layers.map((layer) =>
        Array.from({ length: layer.count }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: layer.depth,
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

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticleSystems();
    };

    window.addEventListener("resize", handleResize);
    createParticleSystems();

    // Animation loop
    const animate = (timestamp) => {
      ctx.fillStyle = "#0a1525";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw depth-based caustics
      const drawCaustics = () => {
        const time = timestamp * 0.0001;

        // Layer 1 (deepest)
        const gradient1 = ctx.createRadialGradient(
          canvas.width / 2 + Math.sin(time * 0.5) * 50,
          -100 + Math.sin(time * 0.3) * 30,
          0,
          canvas.width / 2,
          -100,
          canvas.height * 1.5
        );
        gradient1.addColorStop(0, "rgba(56, 189, 248, 0.05)");
        gradient1.addColorStop(1, "transparent");
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Layer 2 (middle)
        const gradient2 = ctx.createRadialGradient(
          canvas.width * 0.7 + Math.cos(time * 0.4) * 30,
          -50 + Math.cos(time * 0.6) * 20,
          0,
          canvas.width * 0.7,
          -50,
          canvas.height
        );
        gradient2.addColorStop(0, "rgba(56, 189, 248, 0.03)");
        gradient2.addColorStop(1, "transparent");
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Layer 3 (surface)
        const gradient3 = ctx.createRadialGradient(
          canvas.width * 0.3 + Math.sin(time * 0.7) * 20,
          -20 + Math.sin(time * 0.5) * 10,
          0,
          canvas.width * 0.3,
          -20,
          canvas.height * 0.7
        );
        gradient3.addColorStop(0, "rgba(56, 189, 248, 0.02)");
        gradient3.addColorStop(1, "transparent");
        ctx.fillStyle = gradient3;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      drawCaustics();

      // Update and draw particles with depth effect
      particleSystemsRef.current.forEach((particles) => {
        particles.forEach((particle) => {
          // Organic movement
          particle.angle += Math.sin(timestamp * particle.frequency) * 0.02;
          particle.x += Math.cos(particle.angle) * particle.speed;
          particle.y += Math.sin(particle.angle) * particle.speed;

          // Wrap around screen
          if (particle.x > canvas.width + particle.size)
            particle.x = -particle.size;
          if (particle.x < -particle.size)
            particle.x = canvas.width + particle.size;
          if (particle.y > canvas.height + particle.size)
            particle.y = -particle.size;
          if (particle.y < -particle.size)
            particle.y = canvas.height + particle.size;

          // Draw with depth-based glow
          const depthFactor = 1 - (particle.z - 1) / 3;
          const glow = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 3 * depthFactor
          );
          glow.addColorStop(
            0,
            `rgba(147, 197, 253, ${particle.opacity * depthFactor})`
          );
          glow.addColorStop(
            0.6,
            `rgba(147, 197, 253, ${particle.opacity * depthFactor * 0.3})`
          );
          glow.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.fillStyle = glow;
          ctx.arc(
            particle.x,
            particle.y,
            particle.size * 3 * depthFactor,
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

export default AnimatedBackground;
