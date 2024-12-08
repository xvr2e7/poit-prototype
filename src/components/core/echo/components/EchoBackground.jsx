import React, { useEffect, useRef } from "react";

const EchoBackground = () => {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const connectionsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create network nodes
    const createNetwork = () => {
      const nodeCount = Math.floor((canvas.width * canvas.height) / 50000); // Adaptive node count

      // Create nodes with depth
      nodesRef.current = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 3 + 1, // Depth layer (1-4)
        size: Math.random() * 2 + 1,
        speed: 0.1 + Math.random() * 0.2,
        angle: Math.random() * Math.PI * 2,
        frequency: 0.0002 + Math.random() * 0.0004,
      }));

      // Create connections between nearby nodes
      connectionsRef.current = [];
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const dx = nodesRef.current[i].x - nodesRef.current[j].x;
          const dy = nodesRef.current[i].y - nodesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            // Connection threshold
            connectionsRef.current.push({
              from: i,
              to: j,
              opacity: Math.max(0, 1 - distance / 200),
              pulseOffset: Math.random() * Math.PI * 2,
            });
          }
        }
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createNetwork();
    };

    window.addEventListener("resize", handleResize);
    createNetwork();

    const animate = (timestamp) => {
      ctx.fillStyle = "#0a1525";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw deep water caustics
      const drawCaustics = () => {
        const time = timestamp * 0.00005;

        // Deep ambient light
        for (let i = 0; i < 3; i++) {
          const x = (canvas.width * (i + 1)) / 4;
          const gradient = ctx.createRadialGradient(
            x + Math.sin(time + i) * 30,
            -50,
            0,
            x,
            -50,
            canvas.height * 1.2
          );
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.02)");
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };

      drawCaustics();

      // Update and draw connections
      connectionsRef.current.forEach((connection) => {
        const fromNode = nodesRef.current[connection.from];
        const toNode = nodesRef.current[connection.to];

        // Calculate connection opacity based on depth and pulse
        const depthFactor = 1 / ((fromNode.z + toNode.z) / 2);
        const pulsePhase =
          (timestamp * 0.001 + connection.pulseOffset) % (Math.PI * 2);
        const pulseOpacity =
          (Math.sin(pulsePhase) * 0.3 + 0.7) * connection.opacity * depthFactor;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(147, 197, 253, ${pulseOpacity * 0.15})`;
        ctx.lineWidth = depthFactor;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      });

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Update position with gentle movement
        node.angle += Math.sin(timestamp * node.frequency) * 0.01;
        node.x += Math.cos(node.angle) * node.speed;
        node.y += Math.sin(node.angle) * node.speed;

        // Wrap around screen
        if (node.x > canvas.width + node.size) node.x = -node.size;
        if (node.x < -node.size) node.x = canvas.width + node.size;
        if (node.y > canvas.height + node.size) node.y = -node.size;
        if (node.y < -node.size) node.y = canvas.height + node.size;

        // Draw node with depth-based glow
        const depthFactor = 1 / node.z;
        const glow = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.size * 4 * depthFactor
        );
        glow.addColorStop(0, `rgba(147, 197, 253, ${0.4 * depthFactor})`);
        glow.addColorStop(0.5, `rgba(147, 197, 253, ${0.1 * depthFactor})`);
        glow.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(node.x, node.y, node.size * 4 * depthFactor, 0, Math.PI * 2);
        ctx.fill();
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

export default EchoBackground;
