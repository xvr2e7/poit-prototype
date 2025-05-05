import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Logo from "../shared/Logo";

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
      title: "Welcome to POiT",
      content: (
        <>
          <div className="flex justify-center mb-8">
            <Logo size="medium" />
          </div>
          <h3 className="text-xl font-medium text-[#2C8C7C] mb-4">
            Words can connect Worlds.
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            POiT is where poetry becomes a living network of personal truths. It
            is a different kind of social media, one where thoughtful creation
            replaces rapid consumption, where each word is chosen with care, and
            where authentic expression flourishes.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            At its heart, POiT invites you to become the poet of your own
            experience.
          </p>
        </>
      ),
    },
    {
      title: "Pulse Mode",
      content: (
        <>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#2C8C7C]/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#2C8C7C]/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-[#2C8C7C]"></div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-[#2C8C7C] mb-4">
            Pulse Mode
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Begin by collecting words that resonate with you. The same word set
            appears for all poets on the same day. Hover over floating words and
            your cursor will grow as you select them.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Select 5-20 words to form your palette of expression. These words
            will become the raw material for your poem.
          </p>
          <div className="flex justify-center mt-6">
            <div className="text-sm bg-[#2C8C7C]/10 text-[#2C8C7C] px-3 py-1 rounded-full">
              Press W key to view your selections
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Craft Mode",
      content: (
        <>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#2C8C7C]/10 flex items-center justify-center border-2 border-dashed border-[#2C8C7C]/40">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#2C8C7C]/40"></div>
                <div className="w-4 h-4 rounded-sm bg-[#2C8C7C]/60"></div>
                <div className="w-4 h-4 rounded-sm bg-[#2C8C7C]/60"></div>
                <div className="w-4 h-4 rounded-sm bg-[#2C8C7C]/40"></div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-[#2C8C7C] mb-4">
            Craft Mode
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Arrange your selected words into a poem. Click words from the left
            panel to add them to your canvas, then drag them to position.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Add punctuation, common words, your personal flair, and use
            templates to guide your creation. Double-click a word to remove it
            from the canvas.
          </p>
          <div className="flex justify-center mt-6">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[#2C8C7C]/10 text-[#2C8C7C] px-2 py-1 rounded text-center">
                C: Capitalize
              </div>
              <div className="bg-[#2C8C7C]/10 text-[#2C8C7C] px-2 py-1 rounded text-center">
                P: Punctuation
              </div>
              <div className="bg-[#2C8C7C]/10 text-[#2C8C7C] px-2 py-1 rounded text-center">
                F: Filler Words
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Echo Mode",
      content: (
        <>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#2C8C7C]/10 flex items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[#2C8C7C]/40 flex items-center justify-center"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2C8C7C]/60"></div>
                <div className="absolute bottom-0 -left-2 w-3 h-3 rounded-full bg-[#2C8C7C]/40"></div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-[#2C8C7C] mb-4">Echo Mode</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Explore how your poem connects to others through shared vocabulary.
            Click on highlighted words to navigate to connected poems.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            View your Constellation by clicking the network icon to see a 3D
            visualization of your poetic journey. Each connection you make adds
            to your constellation.
          </p>
          <div className="flex justify-center mt-6">
            <div className="text-sm bg-[#2C8C7C]/10 text-[#2C8C7C] px-3 py-1 rounded-full">
              Drag to pan • Ctrl+Wheel to zoom
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Begin Your Journey",
      content: (
        <>
          <div className="flex justify-center mb-8">
            <Logo size="medium" />
          </div>
          <h3 className="text-xl font-medium text-[#2C8C7C] mb-4">
            Ready to Create?
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Your poetic journey awaits. Start by selecting words in Pulse mode,
            arrange them thoughtfully in Craft mode, and discover connections in
            Echo mode.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            You can access this guide anytime by clicking the help icon on the
            home screen.
          </p>
          <div className="flex justify-center mt-8">
            <motion.button
              onClick={onClose}
              className="px-6 py-2 bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 
                text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              POiT!
            </motion.button>
          </div>
        </>
      ),
    },
  ];

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
        bg-black/40 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl max-w-xl w-full max-h-[90vh]
          border border-[#2C8C7C]/20 overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-4 border-b border-[#2C8C7C]/10">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#2C8C7C]/10 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-medium text-[#2C8C7C] text-center px-10">
            {slides[currentSlide].title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-[#2C8C7C]/10 flex justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`p-2 rounded-lg flex items-center gap-1 ${
              currentSlide === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#2C8C7C] hover:bg-[#2C8C7C]/10"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? "bg-[#2C8C7C] scale-125"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`p-2 rounded-lg flex items-center gap-1 ${
              currentSlide === slides.length - 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#2C8C7C] hover:bg-[#2C8C7C]/10"
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingCarousel;
