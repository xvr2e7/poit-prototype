import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronLeft, IconChevronRight, IconClose } from "../shared/icons";

/*
 * The reader's guide, set like a small folio: a frontispiece, the three
 * movements of the daily ritual (numbered — the order is the ritual),
 * and a colophon that opens the door.
 */

// Vignettes drawn in the house line — same chisel voice as the icon set
const VignettePulse = () => (
  <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
    {/* loose words as faint points; a few gathered, pressed solid */}
    {[
      [14, 18], [38, 10], [66, 16], [96, 12], [108, 30],
      [22, 44], [52, 34], [84, 40], [30, 62], [70, 58], [102, 56],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="2" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
    ))}
    <circle cx="52" cy="34" r="3.2" fill="currentColor" />
    <circle cx="84" cy="40" r="3.2" fill="currentColor" />
    <circle cx="38" cy="10" r="3.2" fill="currentColor" />
    {/* the dwelling cursor, a ring closing in */}
    <circle cx="52" cy="34" r="9" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
  </svg>
);

const VignetteCraft = () => (
  <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
    {/* a page; words set on it as short rules of differing measure */}
    <rect x="24" y="6" width="72" height="60" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    <path d="M34 22h28M70 22h14" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    <path d="M42 34h36" stroke="currentColor" strokeWidth="3" strokeLinecap="square" opacity="0.75" />
    <path d="M34 46h16" stroke="currentColor" strokeWidth="3" strokeLinecap="square" opacity="0.75" />
    <path d="M56 46h22" stroke="currentColor" strokeWidth="3" strokeLinecap="square" opacity="0.4" />
    {/* one word still in hand, outside the page */}
    <path d="M6 56h12" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
  </svg>
);

const VignetteEcho = () => (
  <svg viewBox="0 0 120 72" className="w-full h-full" fill="none" aria-hidden="true">
    {/* poems as stars; shared words thread them together */}
    <path
      d="M16 54L42 24L74 40L104 14"
      stroke="currentColor"
      strokeWidth="1.4"
      opacity="0.5"
    />
    <path d="M42 24L64 8M74 40L92 60" stroke="currentColor" strokeWidth="1.4" opacity="0.3" />
    {[
      [16, 54], [42, 24], [74, 40], [104, 14], [64, 8], [92, 60],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={i < 4 ? 3.2 : 2.2} fill="currentColor" opacity={i < 4 ? 1 : 0.55} />
    ))}
  </svg>
);

const OnboardingCarousel = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset to first slide when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const slides = [
    {
      label: "welcome to poit",
      content: (
        <div className="flex flex-col items-center text-center pt-2">
          <span className="font-display font-black text-5xl tracking-[-0.02em] text-ink select-none">
            PO<span className="text-seal">i</span>T
          </span>
          <div className="flex items-center gap-3 mt-4 mb-6">
            <span className="w-8 h-px bg-ink/25" />
            <span className="font-serif italic text-lg text-ink/60">
              words can connect worlds
            </span>
            <span className="w-8 h-px bg-ink/25" />
          </div>
          <p className="text-ink/70 max-w-sm">
            Every day POiT deals the same small pool of words to every poet.
            You gather a handful, set them into a poem, and follow shared
            words into everyone else&apos;s.
          </p>
          <p className="text-ink/70 max-w-sm mt-3">
            One poem a day. Three movements.
          </p>
        </div>
      ),
    },
    {
      label: "the first movement",
      numeral: "I",
      title: "Pulse — gather",
      vignette: VignettePulse,
      body: (
        <>
          <p className="text-ink/70">
            Words drift on the page. Rest your cursor near one that speaks to
            you and it becomes yours — no clicking, just attention.
          </p>
          <p className="text-ink/70 mt-3">
            Take between 5 and 20. They are your ink for the day. Press{" "}
            <kbd className="font-mono text-[11px] bg-ink/5 border border-ink/15 rounded px-1.5 py-0.5">W</kbd>{" "}
            to review what you hold; double-click anywhere when you have enough.
          </p>
        </>
      ),
    },
    {
      label: "the second movement",
      numeral: "II",
      title: "Craft — set",
      vignette: VignetteCraft,
      body: (
        <>
          <p className="text-ink/70">
            Your gathered words wait in the margin. Drag them onto the page
            and set them where they belong — the white space is yours too.
          </p>
          <p className="text-ink/70 mt-3">
            The toolbar lends punctuation, small connecting words, and layout
            guides. Double-click a word to send it back to the margin.
          </p>
        </>
      ),
    },
    {
      label: "the third movement",
      numeral: "III",
      title: "Echo — wander",
      vignette: VignetteEcho,
      body: (
        <>
          <p className="text-ink/70">
            Finished poems join a night sky. Words you share with another poem
            glow — follow one to cross over and read theirs.
          </p>
          <p className="text-ink/70 mt-3">
            Every crossing threads your constellation. The telescope view
            shows the whole pattern your reading has drawn.
          </p>
        </>
      ),
    },
    {
      label: "colophon",
      content: (
        <div className="flex flex-col items-center text-center pt-6">
          <p className="font-serif italic text-xl text-ink/80 max-w-sm leading-relaxed">
            The words are dealt.
            <br />
            The page is blank.
            <br />
            The sky is waiting.
          </p>
          <p className="text-ink/60 mt-6 text-sm max-w-xs">
            Open this guide again anytime from the{" "}
            <span className="font-mono text-seal text-xs">?</span> on the home
            page.
          </p>
          <motion.button
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-seal hover:bg-seal/90 text-paper
              font-mono text-xs tracking-label uppercase rounded-md
              shadow-leaf dark:shadow-leaf-dark transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            begin
          </motion.button>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center
        bg-ink/30 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface rounded-xl max-w-xl w-full max-h-[90vh]
          border border-ink/10 overflow-hidden shadow-leaf dark:shadow-leaf-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-4 border-b border-ink/10">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              aria-label="Close guide"
              className="p-1 rounded-lg hover:bg-ink/5 text-ink/30 hover:text-ink/60"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-label text-seal/70 text-center px-10 py-1">
            {slide.label}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-7 min-h-[340px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {slide.content ? (
                slide.content
              ) : (
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Movement number and vignette */}
                  <div className="w-full sm:w-40 shrink-0 flex sm:flex-col items-center gap-4">
                    <span
                      className="font-display font-black text-4xl text-seal/90 leading-none select-none"
                      aria-hidden="true"
                    >
                      {slide.numeral}
                    </span>
                    <div className="w-28 sm:w-full h-20 text-seal/80">
                      <slide.vignette />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl font-light text-ink mb-3">
                      {slide.title}
                    </h3>
                    {slide.body}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-ink/10 flex justify-between items-center">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`p-2 rounded-lg flex items-center gap-1 ${
              currentSlide === 0
                ? "text-ink/20 cursor-not-allowed"
                : "text-seal hover:bg-seal/5"
            } font-mono text-xs tracking-wide`}
          >
            <IconChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Leaves of the folio */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Page ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? "bg-seal scale-125"
                    : "bg-ink/15 hover:bg-ink/30"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`p-2 rounded-lg flex items-center gap-1 ${
              currentSlide === slides.length - 1
                ? "text-ink/20 cursor-not-allowed"
                : "text-seal hover:bg-seal/5"
            } font-mono text-xs tracking-wide`}
          >
            <span>Next</span>
            <IconChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingCarousel;
