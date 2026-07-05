import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconClose,
  IconNib,
  IconPencil,
  IconPoemlet,
} from "../shared/icons";
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
    className={`p-6 rounded-xl border border-ink/10 backdrop-blur-sm
      hover:bg-seal/5 transition-all duration-300 h-full
      bg-paper/70 hover:border-seal/40
      flex flex-col items-center justify-center
      ${isCenter ? "scale-110 border-seal/30" : ""}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="w-16 h-16 mb-4 flex items-center justify-center">
      {Icon === "Logo" ? (
        <Logo size="medium" />
      ) : (
        <Icon className="w-12 h-12 text-seal" />
      )}
    </div>
    <h3 className="font-serif text-lg font-medium text-ink mb-2">
      {title}
    </h3>
    <p className="text-sm text-ink/60 text-center">
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
        <h3 className="font-serif text-xl font-medium text-ink">
          Notebook
        </h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-seal/10 text-seal"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-label text-seal/70 mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={poemTitle}
          onChange={(e) => setPoemTitle(e.target.value)}
          className="w-full p-2 rounded-lg border border-ink/15 
            bg-paper/70 
            font-serif text-ink placeholder:text-ink/30
            focus:border-seal/60 focus:outline-none focus:ring-1 focus:ring-seal/40"
          placeholder="Name this poem…"
        />
      </div>

      <div className="flex-1 mb-4">
        <label className="block text-label text-seal/70 mb-1.5">
          The poem
        </label>
        <textarea
          value={poemText}
          onChange={(e) => setPoemText(e.target.value)}
          className="w-full h-full p-4 rounded-lg 
            border border-ink/15 
            bg-paper/70 
            font-serif text-lg leading-relaxed text-ink placeholder:text-ink/30
            focus:border-seal focus:outline-none focus:ring-1 focus:ring-seal/40
            resize-none"
          placeholder="Write freely…"
        />
      </div>

      <motion.button
        onClick={handleSavePoem}
        disabled={!poemText.trim() || !poemTitle.trim()}
        className={`w-full py-3 rounded-lg font-mono text-xs tracking-wide transition-colors ${
          !poemText.trim() || !poemTitle.trim()
            ? "bg-ink/10 text-ink/35 cursor-not-allowed"
            : "bg-seal hover:bg-seal/90 text-paper"
        }`}
        whileHover={
          !(!poemText.trim() || !poemTitle.trim()) ? { scale: 1.02 } : {}
        }
        whileTap={
          !(!poemText.trim() || !poemTitle.trim()) ? { scale: 0.98 } : {}
        }
      >
        Save poem
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
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {!selectedOption ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl bg-surface backdrop-blur-lg 
                  rounded-xl border border-ink/10 overflow-hidden p-8 shadow-leaf dark:shadow-leaf-dark"
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-serif text-2xl font-light text-ink">
                    Write a poem
                  </h2>
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-full 
                    text-ink/40 hover:text-ink/70 hover:bg-ink/5 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconClose className="w-5 h-5" />
                  </motion.button>
                </div>

                <p className="text-center font-serif italic text-ink/50 mb-10">
                  choose how the words will find you
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:h-80 overflow-y-auto">
                  <OptionCard
                    title="Digital Collage"
                    description="Collect and arrange words"
                    icon={IconPoemlet}
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
                    icon={IconNib}
                    onClick={() => setSelectedOption("notebook")}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl bg-surface backdrop-blur-lg 
                  rounded-xl border border-ink/10 overflow-hidden h-[80vh] shadow-leaf dark:shadow-leaf-dark"
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
