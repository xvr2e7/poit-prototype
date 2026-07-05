import React from "react";
import { motion } from "framer-motion";

/**
 * The collector's seal — POiT's signature mark.
 *
 * In the tradition POiT borrows from, a reader pressed their seal onto
 * a poem they treasured. Ours is carved in jade. `stamped` renders the
 * seal pressed onto the page; `onClick` makes it an action (liking a poem).
 */
const SIZES = {
  sm: { box: "w-6 h-6", text: "text-[7px]", radius: "rounded-[2px]" },
  md: { box: "w-9 h-9", text: "text-[10px]", radius: "rounded-[3px]" },
  lg: { box: "w-14 h-14", text: "text-[16px]", radius: "rounded-[4px]" },
};

const Seal = ({ size = "md", stamped = true, onClick, label, className = "" }) => {
  const s = SIZES[size] || SIZES.md;

  const face = (
    <motion.span
      initial={false}
      animate={
        stamped
          ? { opacity: 1, scale: 1, rotate: -4 }
          : { opacity: 0.35, scale: 0.96, rotate: -4 }
      }
      whileTap={onClick ? { scale: 1.25, rotate: -7 } : undefined}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      className={`${s.box} ${s.radius} inline-flex items-center justify-center
        select-none ${stamped ? "bg-seal" : "bg-transparent border border-seal/60"}
        ${className}`}
      style={{
        boxShadow: stamped ? "0 0 0 1px rgb(var(--seal) / 0.35)" : "none",
      }}
    >
      <span
        className={`font-mono font-bold leading-none tracking-tight text-center
          ${stamped ? "text-paper" : "text-seal/70"} ${s.text}`}
      >
        PO
        <br />
        iT
      </span>
    </motion.span>
  );

  if (!onClick) return face;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={stamped}
      className="inline-flex items-center gap-2 group"
    >
      {face}
    </button>
  );
};

export default Seal;
