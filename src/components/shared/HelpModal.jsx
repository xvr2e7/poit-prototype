import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const HelpModal = ({ isOpen, onClose, mode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-medium text-[#2C8C7C] mb-4">
              {mode === "pulse"
                ? "Pulse Mode"
                : mode === "craft"
                ? "Craft Mode"
                : mode === "echo"
                ? "Echo Mode"
                : "Help"}
            </h3>

            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
              {mode === "pulse" && (
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
                    Select at least 5 words (and up to 20) that speak to you.
                  </p>
                  <p>
                    <b>3. Curate your Lexicon</b>
                    <br />
                    Double-click anywhere once you've collected enough words to
                    continue.
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

              {mode === "craft" && (
                <>
                  <p>
                    <b>1. Drag and Position</b>
                    <br />
                    Click words from the left panel to add the them by dragging.
                  </p>
                  <p>
                    <b>2. Format and Arrange</b>
                    <br />
                    Select a word to change its capitalization. Use punctuation
                    and common words to complete your poem.
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
                    Click the preview button to see your poem, then continue to
                    Echo mode.
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

              {mode === "echo" && (
                <>
                  <p>
                    <b>1. Explore Word Connections</b>
                    <br />
                    Click on glowing highlighted words to navigate to connected
                    poems through shared vocabulary.
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
                    poetic journey and connections.
                  </p>
                  <p>
                    <b>4. Explore the Constellation</b>
                    <br />
                    In constellation view, drag to rotate the 3D space. Click a
                    poem layer's border to focus on it, or double-click to
                    expand to full view.
                  </p>
                  <p>
                    <b>5. Toggle Stargazing Mode</b>
                    <br />
                    Use the telescope button to switch to stargazing view,
                    watching shared words as stars forming a unique celestial
                    pattern.
                  </p>
                  <p className="text-xs text-gray-500 italic mt-6">
                    Discover how your words connect to form a constellation of
                    meaning across poems.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
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
  );
};

export default HelpModal;
