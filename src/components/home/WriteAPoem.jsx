import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Book, Edit, Pen } from "lucide-react";
import Logo from "../shared/Logo";

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

// Digital Collage Components
const WordListView = ({ onBack, onSaveList }) => {
  const [wordList, setWordList] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [listName, setListName] = useState("");

  const handleAddWord = () => {
    if (newWord.trim()) {
      setWordList([...wordList, newWord.trim()]);
      setNewWord("");
    }
  };

  const handleRemoveWord = (indexToRemove) => {
    setWordList(wordList.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = () => {
    if (listName.trim() && wordList.length > 0) {
      onSaveList({ name: listName, words: wordList });
      setWordList([]);
      setListName("");
      onBack();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-white">Create Word List</h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-100 dark:text-white font-medium mb-1">
          List Name
        </label>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full p-2 rounded-lg border border-[#2C8C7C]/40 
            bg-white/60 dark:bg-gray-800/70 
            text-gray-900 dark:text-white
            focus:border-[#2C8C7C] focus:outline-none focus:ring-1 focus:ring-[#2C8C7C]/60"
          placeholder="Enter list name..."
        />
      </div>

      <div className="mb-4 flex">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddWord()}
          className="flex-1 p-2 rounded-l-lg border border-[#2C8C7C]/40 
            bg-white/60 dark:bg-gray-800/70 
            text-gray-900 dark:text-white
            focus:border-[#2C8C7C] focus:outline-none focus:ring-1 focus:ring-[#2C8C7C]/60"
          placeholder="Enter a word..."
        />
        <button
          onClick={handleAddWord}
          className="px-4 py-2 rounded-r-lg bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 
            text-white font-medium shadow-sm transition-colors"
        >
          Add
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto border border-[#2C8C7C]/40 rounded-lg 
        p-4 bg-white/30 dark:bg-gray-800/40 mb-4"
      >
        {wordList.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {wordList.map((word, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg 
                  bg-white/60 dark:bg-gray-800/80 
                  border border-[#2C8C7C]/30 dark:border-[#2C8C7C]/40"
              >
                <span className="text-gray-800 dark:text-gray-100">{word}</span>
                <button
                  onClick={() => handleRemoveWord(index)}
                  className="p-1 rounded-full hover:bg-[#2C8C7C]/10 
                    text-gray-500 dark:text-gray-400 
                    hover:text-[#2C8C7C] dark:hover:text-[#2C8C7C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            Add words to your list
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!listName.trim() || wordList.length === 0}
        className={`w-full py-3 rounded-lg transition-colors ${
          !listName.trim() || wordList.length === 0
            ? "bg-gray-500 dark:bg-gray-700 text-gray-300 dark:text-gray-400 cursor-not-allowed"
            : "bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 text-white font-medium shadow-sm"
        }`}
      >
        Save Word List
      </button>
    </div>
  );
};

const CanvasView = ({ onBack, wordLists, onSavePoem }) => {
  const [selectedLists, setSelectedLists] = useState([]);
  const [canvasWords, setCanvasWords] = useState([]);
  const [poemTitle, setPoemTitle] = useState("My Poem");

  // Toggle word list selection
  const toggleList = (listName) => {
    if (selectedLists.includes(listName)) {
      setSelectedLists(selectedLists.filter((name) => name !== listName));
    } else {
      setSelectedLists([...selectedLists, listName]);
    }
  };

  // Load words from selected lists to canvas
  const loadWordsToCanvas = () => {
    const words = [];
    selectedLists.forEach((listName) => {
      const list = wordLists.find((l) => l.name === listName);
      if (list) {
        list.words.forEach((word) => {
          words.push({
            id: `word-${Math.random().toString(36).substr(2, 9)}`,
            text: word,
            type: "word",
            position: {
              x: Math.random() * 500 + 50,
              y: Math.random() * 300 + 50,
            },
          });
        });
      }
    });
    setCanvasWords(words);
  };

  // Save poem
  const handleSavePoem = () => {
    onSavePoem({
      title: poemTitle,
      components: canvasWords,
      type: "digital_collage",
      date: new Date().toLocaleDateString(),
    });
    onBack();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-white">
          Digital Collage Canvas
        </h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/20 text-[#2C7C8C]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-100 dark:text-white font-medium mb-1">
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
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div
          className="border border-[#2C8C7C]/40 rounded-lg p-4 
          bg-white/30 dark:bg-gray-800/40 shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-100 dark:text-white mb-2">
            Select Word Lists
          </h4>
          {wordLists.length > 0 ? (
            <div className="space-y-2">
              {wordLists.map((list) => (
                <div key={list.name} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`list-${list.name}`}
                    checked={selectedLists.includes(list.name)}
                    onChange={() => toggleList(list.name)}
                    className="mr-2 accent-[#2C8C7C]"
                  />
                  <label
                    htmlFor={`list-${list.name}`}
                    className="text-sm text-gray-100 dark:text-white"
                  >
                    {list.name} ({list.words.length} words)
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              No word lists available
            </div>
          )}
          <button
            onClick={loadWordsToCanvas}
            disabled={selectedLists.length === 0}
            className={`mt-4 w-full py-2 rounded-lg transition-colors ${
              selectedLists.length === 0
                ? "bg-gray-500 dark:bg-gray-700 text-gray-300 dark:text-gray-400 cursor-not-allowed"
                : "bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 text-white font-medium shadow-sm"
            }`}
          >
            Load Words
          </button>
        </div>

        <div
          className="border border-[#2C8C7C]/40 rounded-lg p-4 
          bg-white/30 dark:bg-gray-800/40 shadow-sm"
        >
          <h4 className="text-sm font-medium text-gray-100 dark:text-white mb-2">
            Canvas Preview
          </h4>
          <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            {canvasWords.length > 0
              ? `${canvasWords.length} words loaded into canvas`
              : "Select lists and load words"}
          </div>
        </div>
      </div>

      <div
        className="flex-1 border border-[#2C8C7C]/40 rounded-lg 
        bg-white/50 dark:bg-gray-800/70 relative mb-4 
        shadow-inner overflow-hidden"
      >
        {canvasWords.length > 0 ? (
          canvasWords.map((word) => (
            <div
              key={word.id}
              className="absolute select-none px-4 py-2 rounded-lg 
                bg-white/80 dark:bg-gray-800/90 
                shadow-sm text-gray-900 dark:text-white
                border border-[#2C8C7C]/30 dark:border-[#2C8C7C]/40"
              style={{
                left: word.position.x,
                top: word.position.y,
              }}
            >
              {word.text}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            Words will appear here
          </div>
        )}
      </div>

      <button
        onClick={handleSavePoem}
        disabled={canvasWords.length === 0}
        className={`w-full py-3 rounded-lg transition-colors ${
          canvasWords.length === 0
            ? "bg-gray-500 dark:bg-gray-700 text-gray-300 dark:text-gray-400 cursor-not-allowed"
            : "bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 text-white font-medium shadow-sm"
        }`}
      >
        Save Poem
      </button>
    </div>
  );
};

const DigitalCollage = ({ onBack, onSavePoem }) => {
  const [view, setView] = useState("options");
  const [wordLists, setWordLists] = useState([]);

  const handleSaveWordList = (list) => {
    setWordLists([...wordLists, list]);
  };

  return (
    <div className="h-full">
      {view === "options" && (
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-[#2C8C7C]">
              Digital Collage
            </h3>
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-[#2C8C7C]/10 text-[#2C8C7C]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-6">
            <button
              onClick={() => setView("words")}
              className="p-6 rounded-xl border border-[#2C8C7C]/40 
                bg-white/20 dark:bg-gray-800/40 shadow-sm
                hover:bg-[#2C8C7C]/20 hover:border-[#2C8C7C]/60 
                transition-all duration-300 
                flex flex-col items-center justify-center"
            >
              <Book className="w-12 h-12 text-[#2C8C7C] mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                Words
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Create and manage word lists
              </p>
            </button>
            <button
              onClick={() => setView("canvas")}
              className="p-6 rounded-xl border border-[#2C8C7C]/20 
                bg-white/10 dark:bg-gray-700/30 shadow-sm
                hover:bg-[#2C8C7C]/10 hover:border-[#2C8C7C]/40 
                transition-all duration-300 
                flex flex-col items-center justify-center"
            >
              <Edit className="w-12 h-12 text-[#2C8C7C] mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                Canvas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Arrange words from your lists
              </p>
            </button>
          </div>
        </div>
      )}

      {view === "words" && (
        <WordListView
          onBack={() => setView("options")}
          onSaveList={handleSaveWordList}
        />
      )}

      {view === "canvas" && (
        <CanvasView
          onBack={() => setView("options")}
          wordLists={wordLists}
          onSavePoem={onSavePoem}
        />
      )}
    </div>
  );
};

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

      <button
        onClick={handleSavePoem}
        disabled={!poemText.trim() || !poemTitle.trim()}
        className={`w-full py-3 rounded-lg transition-colors ${
          !poemText.trim() || !poemTitle.trim()
            ? "bg-gray-500 dark:bg-gray-700 text-gray-300 dark:text-gray-400 cursor-not-allowed"
            : "bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 text-white font-medium shadow-sm"
        }`}
      >
        Save Poem
      </button>
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
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 
                    backdrop-blur-sm  text-black dark:text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
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
