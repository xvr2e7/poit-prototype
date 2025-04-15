import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Book, Edit, Pen } from "lucide-react";
import Logo from "../shared/Logo";
import DigitalCollage from "./DigitalCollage";

const OptionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  isCenter = false,
}) => (
  <motion.button
    onClick={onClick}
    className={`p-6 rounded-xl border border-[#2C8C7C]/20 backdrop-blur-sm
      hover:bg-[#2C8C7C]/10 transition-all duration-300 h-full
      bg-white/10 dark:bg-gray-700/30 hover:border-[#2C8C7C]/40
      flex flex-col items-center justify-center
      ${isCenter ? "scale-110" : ""}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="w-16 h-16 mb-4 flex items-center justify-center">
      {Icon === "Logo" ? (
        <Logo size="medium" />
      ) : (
        <Icon className="w-12 h-12 text-[#2C8C7C]" />
      )}
    </div>
    <h3 className="text-lg font-medium text-black dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-900 dark:text-gray-200 text-center">
      {description}
    </p>
  </motion.button>
);

// Notebook Component
const Notebook = ({ onBack, onSavePoem }) => {
  const [poemText, setPoemText] = useState("");
  const [poemTitle, setPoemTitle] = useState("My Poem");

  const handleSavePoem = () => {
    if (poemText.trim() && poemTitle.trim()) {
      onSavePoem({
        title: poemTitle,
        content: poemText,
        type: "notebook",
        date: new Date().toLocaleDateString(),
      });
      onBack();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-black dark:text-white">
          Notebook
        </h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/20 text-[#2C7C8C]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-800 dark:text-white font-medium mb-1">
          Poem Title
        </label>
        <input
          type="text"
          value={poemTitle}
          onChange={(e) => setPoemTitle(e.target.value)}
          className="w-full p-2 rounded-lg border border-[#2C8C7C]/20 
            bg-white/50 dark:bg-gray-800/50 
            text-gray-800 dark:text-gray-100
            focus:border-[#2C8C7C]/60 focus:outline-none focus:ring-1 focus:ring-[#2C8C7C]/40"
          placeholder="Enter poem title..."
        />
      </div>

      <div className="flex-1 mb-4">
        <label className="block text-sm text-gray-800 dark:text-white font-medium mb-1">
          Poem Content
        </label>
        <textarea
          value={poemText}
          onChange={(e) => setPoemText(e.target.value)}
          className="w-full h-full p-4 rounded-lg 
            border border-[#2C8C7C]/40 
            bg-white/60 dark:bg-gray-800/70 
            text-gray-900 dark:text-white 
            focus:border-[#2C8C7C] focus:outline-none focus:ring-1 focus:ring-[#2C8C7C]/60
            resize-none shadow-inner"
          placeholder="Type your poem here..."
        />
      </div>

      <motion.button
        onClick={handleSavePoem}
        disabled={!poemText.trim() || !poemTitle.trim()}
        className={`w-full py-3 rounded-lg transition-colors ${
          !poemText.trim() || !poemTitle.trim()
            ? "bg-gray-500 dark:bg-gray-700 text-gray-300 dark:text-gray-400 cursor-not-allowed"
            : "bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 text-white font-medium shadow-sm"
        }`}
        whileHover={
          !(!poemText.trim() || !poemTitle.trim()) ? { scale: 1.02 } : {}
        }
        whileTap={
          !(!poemText.trim() || !poemTitle.trim()) ? { scale: 0.98 } : {}
        }
      >
        Save Poem
      </motion.button>
    </div>
  );
};

const WriteAPoem = ({ isOpen, onClose, onStartPOiT, onSavePoem }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSavePoem = (poem) => {
    onSavePoem(poem);
    setSelectedOption(null);
  };

  const handleBack = () => {
    setSelectedOption(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-950/90 overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {!selectedOption ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl bg-gray-300 dark:bg-gray-600/80 backdrop-blur-lg 
                  rounded-xl border border-[#2C8C7C]/40 overflow-hidden p-8 shadow-xl"
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-medium text-black dark:text-white">
                    Write a Poem
                  </h2>
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 
                    backdrop-blur-sm  text-black dark:text-white hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <p className="text-center text-black dark:text-white mb-10">
                  Choose your creative method
                </p>

                <div className="grid grid-cols-3 gap-6 h-80">
                  <OptionCard
                    title="Digital Collage"
                    description="Collect and arrange words"
                    icon={Book}
                    onClick={() => setSelectedOption("digitalCollage")}
                  />
                  <OptionCard
                    title="POiT!"
                    description="The Authentic POiT experience"
                    icon="Logo"
                    onClick={onStartPOiT}
                    isCenter={true}
                  />
                  <OptionCard
                    title="Notebook"
                    description="Write down anything"
                    icon={Pen}
                    onClick={() => setSelectedOption("notebook")}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl bg-gray-300 dark:bg-gray-600/80 backdrop-blur-lg 
                  rounded-xl border border-[#2C8C7C]/40 overflow-hidden h-[80vh] shadow-xl"
              >
                {selectedOption === "digitalCollage" && (
                  <DigitalCollage
                    onBack={handleBack}
                    onSavePoem={handleSavePoem}
                  />
                )}
                {selectedOption === "notebook" && (
                  <Notebook onBack={handleBack} onSavePoem={handleSavePoem} />
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WriteAPoem;
