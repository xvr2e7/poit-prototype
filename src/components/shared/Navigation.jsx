import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, HelpCircle, Save, Home, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "./AdaptiveBackground";

const Navigation = ({ currentMode, onExit, onSave, onExitToHome }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const { theme, setTheme } = useTheme();
  const menuRef = useRef(null);

  // Check if user has seen tutorial before
  useEffect(() => {
    // Different localStorage keys for different modes
    const tutorialKey = `hasSeen${
      currentMode.charAt(0).toUpperCase() + currentMode.slice(1)
    }Tutorial`;
    const hasSeenBefore = localStorage.getItem(tutorialKey);
    setHasSeenTutorial(!!hasSeenBefore);

    // Show tutorial automatically for first-time visitors to each mode
    if (
      !hasSeenBefore &&
      (currentMode === "pulse" ||
        currentMode === "craft" ||
        currentMode === "echo")
    ) {
      setTimeout(() => setShowHelp(true), 1000);
      localStorage.setItem(tutorialKey, "true");
    }
  }, [currentMode]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    if (onSave) onSave();
    setIsOpen(false);
  };

  const handleHome = () => {
    if (onSave) onSave(); // Save before exiting

    // Use the provided callback instead of directly manipulating window.location
    if (onExitToHome) {
      onExitToHome();
    } else if (onExit) {
      // Fallback to onExit if onExitToHome is not provided
      onExit();
    }

    setIsOpen(false);
  };

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark", theme !== "dark");
    setTheme(theme === "dark" ? "light" : "dark");
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed top-6 left-6 z-50" ref={menuRef}>
        <div className="relative">
          {/* Menu Button */}
          <motion.button
            className="flex items-center justify-center p-2 rounded-lg 
              bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/10
              hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo size="small" />
            <ChevronDown
              className="w-3 h-3 text-[#2C8C7C]/60 ml-1.5"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-48 
                  bg-white/10 dark:bg-black/20 backdrop-blur-md 
                  rounded-lg border border-[#2C8C7C]/10 
                  overflow-hidden"
              >
                <div className="p-1">
                  {/* Theme Toggle */}
                  <motion.button
                    onClick={handleThemeToggle}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      text-sm text-[#2C8C7C] rounded-lg
                      hover:bg-[#2C8C7C]/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </motion.button>

                  {/* Help Button */}
                  <motion.button
                    onClick={() => {
                      setShowHelp(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      text-sm text-[#2C8C7C] rounded-lg
                      hover:bg-[#2C8C7C]/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <HelpCircle size={16} />
                    Help
                  </motion.button>

                  {/* Save Button */}
                  <motion.button
                    onClick={handleSave}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      text-sm text-[#2C8C7C] rounded-lg
                      hover:bg-[#2C8C7C]/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={16} />
                    Save Progress
                  </motion.button>

                  {/* Home Button */}
                  <motion.button
                    onClick={handleHome}
                    className="w-full flex items-center gap-3 px-4 py-2.5 
                      text-sm text-[#2C8C7C] rounded-lg
                      hover:bg-[#2C8C7C]/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Home size={16} />
                    Return Home
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center 
              bg-black/40 backdrop-blur-sm p-6"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-medium text-[#2C8C7C] mb-4">
                {currentMode === "pulse"
                  ? "How to Use Pulse Mode"
                  : currentMode === "craft"
                  ? "How to Use Craft Mode"
                  : currentMode === "echo"
                  ? "How to Use Echo Mode"
                  : "Help"}
              </h3>

              <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
                {currentMode === "pulse" && (
                  <>
                    <p>
                      <b>1. Hover and Dwell</b>
                      <br />
                      Move your cursor near a word and hover there briefly to
                      select it.
                    </p>
                    <p>
                      <b>2. Gather Words</b>
                      <br />
                      Select at least 5 words (and up to 10) that speak to you.
                    </p>
                    <p>
                      <b>3. Curate your Lexicon</b>
                      <br />
                      Double-click anywhere once you've collected enough words
                      to continue.
                    </p>
                    <p>
                      <b>4. View Selected Words</b>
                      <br />
                      Press the{" "}
                      <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        W
                      </kbd>{" "}
                      key anytime to view and manage your selected words.
                    </p>
                    <p className="text-xs text-gray-500 italic mt-6">
                      These will be your raw material for creation.
                    </p>
                  </>
                )}

                {currentMode === "craft" && (
                  <>
                    <p>
                      <b>1. Drag and Position</b>
                      <br />
                      Drag words from the left panel onto the canvas. Position
                      them by dragging.
                    </p>
                    <p>
                      <b>2. Format and Arrange</b>
                      <br />
                      Select a word to change its capitalization. Use
                      punctuation and common words to complete your poem.
                    </p>
                    <p>
                      <b>3. Create Your Poem</b>
                      <br />
                      Arrange your words and punctuation to create your poem.
                      Double-click a word to remove it from the canvas.
                    </p>
                    <p>
                      <b>4. Preview and Continue</b>
                      <br />
                      Click the preview button to see your poem, then continue
                      to Echo mode.
                    </p>
                    <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="font-medium mb-2">Keyboard Shortcuts:</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                            C
                          </kbd>
                          <span className="ml-2">Capitalization</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                            P
                          </kbd>
                          <span className="ml-2">Punctuation</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                            F
                          </kbd>
                          <span className="ml-2">Filler Words</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                            T
                          </kbd>
                          <span className="ml-2">Templates</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                            S
                          </kbd>
                          <span className="ml-2">Signatures</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                            B
                          </kbd>
                          <span className="ml-2">Canvas Background</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                            W
                          </kbd>
                          <span className="ml-2">Word Pool</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                            R
                          </kbd>
                          <span className="ml-2">Reset Canvas</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentMode === "echo" && (
                  <>
                    <p>
                      <b>1. Explore Word Connections</b>
                      <br />
                      Click on glowing highlighted words to navigate to
                      connected poems.
                    </p>
                    <p>
                      <b>2. Navigate the Canvas</b>
                      <br />
                      Drag to pan around the poem. Use Ctrl+Wheel or the zoom
                      buttons to zoom in/out.
                    </p>
                    <p>
                      <b>3. View Your Constellation</b>
                      <br />
                      Click the network icon to see a 3D visualization of your
                      poetic journey.
                    </p>
                    <p>
                      <b>4. Interact with the Network</b>
                      <br />
                      In network view, drag to rotate, double-click layers to
                      expand, and use arrows to navigate.
                    </p>
                    <p className="text-xs text-gray-500 italic mt-6">
                      Discover how your words connect to form a constellation of
                      meaning.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-[#2C8C7C]/10 hover:bg-[#2C8C7C]/20 
                    text-[#2C8C7C] rounded-lg transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
