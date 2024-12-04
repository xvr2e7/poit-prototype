import {
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

export const useWordAnimation = () => {
  // Core animation controls
  const controls = useAnimation();

  // Base position values with spring physics
  const x = useSpring(0, {
    stiffness: 100,
    damping: 30,
  });
  const y = useSpring(0, {
    stiffness: 100,
    damping: 30,
  });

  // Glow effect using motion values
  const glow = useMotionValue(0.5);
  const opacity = useTransform(glow, [0, 1], [0.4, 0.8]);
  const scale = useTransform(glow, [0, 1], [1, 1.1]);

  // Animation variants
  const variants = {
    ambient: {
      scale: 1,
      filter: "brightness(1)",
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.05,
      filter: "brightness(1.2)",
      transition: {
        duration: 0.3,
      },
    },
    tap: {
      scale: 0.98,
      filter: "brightness(1.4)",
      transition: {
        duration: 0.2,
      },
    },
  };

  // Animation handlers
  const handleHoverStart = () => {
    controls.start("hover");
    glow.set(0.8);
  };

  const handleHoverEnd = () => {
    controls.start("ambient");
    glow.set(0.5);
  };

  const handleTapStart = () => {
    controls.start("tap");
    glow.set(1);
  };

  return {
    controls,
    position: { x, y },
    glow: { value: glow, opacity, scale },
    variants,
    handlers: {
      onHoverStart: handleHoverStart,
      onHoverEnd: handleHoverEnd,
      onTapStart: handleTapStart,
    },
  };
};
