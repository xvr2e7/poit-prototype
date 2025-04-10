import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./AdaptiveBackground";

const DynamicLogo = ({ size = "large", animate = true, onClick }) => {
  const eyeRef = useRef(null);
  const containerRef = useRef(null);
  const { isDark } = useTheme();
  const [eyePosition, setEyePosition] = useState({ top: 47, left: 59.3 });

  const sizeConfig = {
    large: { width: 300, height: 300, eyeSize: 9 },
    medium: { width: 150, height: 150, eyeSize: 5 },
    small: { width: 50, height: 50, eyeSize: 2 },
  }[size];

  const maxRadius = size === "large" ? 5 : size === "medium" ? 3 : 1;

  useEffect(() => {
    if (!animate || !eyeRef.current || !containerRef.current) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current || !eyeRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      const eyeCenterX =
        containerRect.left + (containerRect.width * eyePosition.left) / 100;
      const eyeCenterY =
        containerRect.top + (containerRect.height * eyePosition.top) / 100;

      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const angle = Math.atan2(deltaY, deltaX);

      // Calculate the distance, but cap it to maintain the eye within bounds
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 25, maxRadius);

      const eyeX = Math.cos(angle) * distance;
      const eyeY = Math.sin(angle) * distance;

      eyeRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [animate, maxRadius, eyePosition]);

  const logoSrc = isDark ? "/favicon_dark.svg" : "/favicon_light.svg";
  const eyeballColor = isDark ? "white" : "black";

  return (
    <motion.div
      ref={containerRef}
      className="relative cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Logo image */}
      <img
        src={logoSrc}
        alt="POiT"
        width={sizeConfig.width}
        height={sizeConfig.height}
      />

      {/* Eyeball */}
      <div
        ref={eyeRef}
        className={`absolute rounded-full z-10 pointer-events-none`}
        style={{
          width: sizeConfig.eyeSize,
          height: sizeConfig.eyeSize,
          backgroundColor: eyeballColor,
          top: `${eyePosition.top}%`,
          left: `${eyePosition.left}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Subtle glow effect */}
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-30 -z-10"
          style={{
            background:
              "radial-gradient(circle, rgba(44,140,124,0.2) 0%, rgba(44,140,124,0) 70%)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
};

export default DynamicLogo;
