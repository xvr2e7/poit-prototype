import React from "react";
import { motion } from "framer-motion";
import { perlin } from "../../../../utils/animations/animationUtils";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#1a1f3d]">
      {/* Deep water gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-transparent" />

      {/* Ambient particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-cyan-500/20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Light rays */}
      <div className="absolute top-0 inset-x-0 h-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 h-full w-20 bg-gradient-to-b from-cyan-500/5 to-transparent"
            initial={{ x: -100, rotate: 15 }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
