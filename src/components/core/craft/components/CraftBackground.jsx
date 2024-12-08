import React, { useEffect, useRef } from "react";

const CraftBackground = () => {
  const canvasRef = useRef(null);
  const particleSystemsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particle systems with depth layers for craft mode
    const createParticleSystems = () => {
      const layers = [
        {
          count: 8, // Fewer particles in foreground for less distraction
          speedRange: [0.2, 0.3],
          sizeRange: [1.5, 2.5],
          opacity: 0.6,
          depth: 1,
        },
        {
          count: 12,
          speedRange: [0.1, 0.2],
          sizeRange: [1, 2],
          opacity: 0.4,
          depth: 2,
        },
        {
          count: 20,
          speedRange: [0.03, 0.1],
          sizeRange: [0.5, 1],
          opacity: 0.3,
          depth: 3,
        },
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
          frequency: 0.0003 + Math.random() * 0.0007, // Slower frequency for gentler movement
        }))
      );
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticleSystems();
    };

    window.addEventListener("resize", handleResize);
    createParticleSystems();

    const animate = (timestamp) => {
      ctx.fillStyle = "#0a1525";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle caustics effect for craft mode
      const drawCaustics = () => {
        const time = timestamp * 0.00007; // Slower movement

        // Deeper, more subtle caustics
        const gradient = ctx.createRadialGradient(
          canvas.width / 2 + Math.sin(time) * 30,
          -50 + Math.cos(time * 0.7) * 20,
          0,
          canvas.width / 2,
          -50,
          canvas.height * 1.2
        );
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.03)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Additional ambient light columns
        for (let i = 0; i < 3; i++) {
          const x = (canvas.width * (i + 1)) / 4;
          const gradient = ctx.createRadialGradient(
            x + Math.sin(time + i) * 20,
            -30,
            0,
            x,
            -30,
            canvas.height
          );
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.02)");
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };

      drawCaustics();

      // Update and draw particles with more subtle movement
      particleSystemsRef.current.forEach((particles) => {
        particles.forEach((particle) => {
          // Gentler organic movement
          particle.angle += Math.sin(timestamp * particle.frequency) * 0.01;
          particle.x += Math.cos(particle.angle) * particle.speed;
          particle.y += Math.sin(particle.angle) * particle.speed;

          // Screen wrapping
          if (particle.x > canvas.width + particle.size)
            particle.x = -particle.size;
          if (particle.x < -particle.size)
            particle.x = canvas.width + particle.size;
          if (particle.y > canvas.height + particle.size)
            particle.y = -particle.size;
          if (particle.y < -particle.size)
            particle.y = canvas.height + particle.size;

          // Softer glow effect
          const depthFactor = 1 - (particle.z - 1) / 3;
          const glow = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 2.5 * depthFactor
          );
          glow.addColorStop(
            0,
            `rgba(147, 197, 253, ${particle.opacity * depthFactor * 0.8})`
          );
          glow.addColorStop(
            0.5,
            `rgba(147, 197, 253, ${particle.opacity * depthFactor * 0.2})`
          );
          glow.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.fillStyle = glow;
          ctx.arc(
            particle.x,
            particle.y,
            particle.size * 2.5 * depthFactor,
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

export default CraftBackground;
