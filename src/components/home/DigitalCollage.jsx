import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, List, Book, Edit } from "lucide-react";
import CanvasView from "./CanvasView";

const ExistingListsView = ({ onBack, wordLists, onSelectList }) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-white">Select a List</h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {wordLists.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {wordLists.map((list) => (
            <motion.button
              key={list.name}
              onClick={() => onSelectList(list)}
              className="p-4 rounded-lg border border-[#2C8C7C]/40 
                bg-white/20 dark:bg-gray-800/40 
                hover:bg-[#2C8C7C]/20 hover:border-[#2C8C7C]/60 
                transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <h4 className="text-lg font-medium text-gray-100 dark:text-white mb-1">
                {list.name}
              </h4>
              <p className="text-sm text-gray-300 dark:text-gray-300">
                {list.words.length} words
              </p>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 dark:text-gray-500">
            No word lists available. Create a new list first.
          </p>
        </div>
      )}
    </div>
  );
};

const ListSelectionView = ({ onBack, wordLists, onLoadList }) => {
  const [selectedLists, setSelectedLists] = useState([]);

  const toggleList = (listName) => {
    if (selectedLists.includes(listName)) {
      setSelectedLists(selectedLists.filter((name) => name !== listName));
    } else {
      setSelectedLists([...selectedLists, listName]);
    }
  };

  const handleLoadLists = () => {
    onLoadList(selectedLists);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-white">Select Lists</h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {wordLists.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {wordLists.map((list) => (
              <motion.div
                key={list.name}
                className="flex items-center p-3 border border-[#2C8C7C]/30 rounded-lg"
                whileHover={{ backgroundColor: "rgba(44, 140, 124, 0.1)" }}
              >
                <input
                  type="checkbox"
                  id={`select-${list.name}`}
                  checked={selectedLists.includes(list.name)}
                  onChange={() => toggleList(list.name)}
                  className="mr-3 h-5 w-5 accent-[#2C8C7C]"
                />
                <label
                  htmlFor={`select-${list.name}`}
                  className="flex-1 cursor-pointer"
                >
                  <h4 className="text-base font-medium text-gray-100 dark:text-white">
                    {list.name}
                  </h4>
                  <p className="text-sm text-gray-300 dark:text-gray-400">
                    {list.words.length} words
                  </p>
                </label>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 dark:text-gray-500">
            No word lists available. Create a new list first.
          </p>
        </div>
      )}

      <motion.button
        onClick={handleLoadLists}
        disabled={selectedLists.length === 0}
        className={`mt-4 w-full py-3 rounded-lg transition-colors ${
          selectedLists.length === 0
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 text-white font-medium shadow-sm"
        }`}
        whileHover={selectedLists.length > 0 ? { scale: 1.02 } : {}}
        whileTap={selectedLists.length > 0 ? { scale: 0.98 } : {}}
      >
        Load Selected Lists
      </motion.button>
    </div>
  );
};

const WordListView = ({ onBack, onSaveList, initialList = null }) => {
  const [wordList, setWordList] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [listName, setListName] = useState("");

  // Initialize with existing list if provided
  useEffect(() => {
    if (initialList) {
      setListName(initialList.name);
      setWordList(initialList.words);
    }
  }, [initialList]);

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
        <h3 className="text-xl font-medium text-white">
          {initialList ? "Edit Word List" : "Create Word List"}
        </h3>
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
        <motion.button
          onClick={handleAddWord}
          className="px-4 py-2 rounded-r-lg bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 
            text-white font-medium shadow-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add
        </motion.button>
      </div>

      <div
        className="flex-1 overflow-y-auto border border-[#2C8C7C]/40 rounded-lg 
        p-4 bg-white/30 dark:bg-gray-800/40 mb-4"
      >
        {wordList.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {wordList.map((word, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg 
                  bg-white/60 dark:bg-gray-800/80 
                  border border-[#2C8C7C]/30 dark:border-[#2C8C7C]/40"
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                }}
              >
                <span className="text-gray-800 dark:text-gray-100">{word}</span>
                <motion.button
                  onClick={() => handleRemoveWord(index)}
                  className="p-1 rounded-full hover:bg-[#2C8C7C]/10 
                    text-gray-500 dark:text-gray-400 
                    hover:text-[#2C8C7C] dark:hover:text-[#2C8C7C]"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            Add words to your list
          </div>
        )}
      </div>

      <motion.button
        onClick={handleSave}
        disabled={!listName.trim() || wordList.length === 0}
        className={`w-full py-3 rounded-lg transition-colors ${
          !listName.trim() || wordList.length === 0
            ? "bg-gray-500 dark:bg-gray-700 text-gray-300 dark:text-gray-400 cursor-not-allowed"
            : "bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 text-white font-medium shadow-sm"
        }`}
        whileHover={
          !(!listName.trim() || wordList.length === 0) ? { scale: 1.02 } : {}
        }
        whileTap={
          !(!listName.trim() || wordList.length === 0) ? { scale: 0.98 } : {}
        }
      >
        Save Word List
      </motion.button>
    </div>
  );
};

const DigitalCollage = ({ onBack, onSavePoem }) => {
  const [view, setView] = useState("options");
  const [wordLists, setWordLists] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentList, setCurrentList] = useState(null);
  const [loadedWords, setLoadedWords] = useState([]);

  // Effect to load saved word lists from localStorage
  useEffect(() => {
    const savedLists = JSON.parse(
      localStorage.getItem("poit_word_lists") || "[]"
    );
    setWordLists(savedLists);
  }, []);

  // Save word lists to localStorage when they change
  useEffect(() => {
    localStorage.setItem("poit_word_lists", JSON.stringify(wordLists));
  }, [wordLists]);

  const handleSaveWordList = (list) => {
    // Check if list already exists and update it
    const existingIndex = wordLists.findIndex((l) => l.name === list.name);
    if (existingIndex !== -1) {
      const updatedLists = [...wordLists];
      updatedLists[existingIndex] = list;
      setWordLists(updatedLists);
    } else {
      // Add new list
      setWordLists([...wordLists, list]);
    }
  };

  const handleSelectList = (list) => {
    setCurrentList(list);
    setView("words");
  };

  const handleLoadListWords = (listNames) => {
    const words = [];
    listNames.forEach((name) => {
      const list = wordLists.find((l) => l.name === name);
      if (list) {
        words.push(...list.words);
      }
    });

    setLoadedWords(words);
    setView("fullScreenCanvas");
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
            {/* Words Card */}
            <div
              className="relative rounded-xl overflow-hidden"
              onMouseEnter={() => setHoveredCard("words")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <AnimatePresence>
                {hoveredCard === "words" ? (
                  <motion.div
                    className="absolute inset-0 flex flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Create New List Option */}
                    <motion.button
                      onClick={() => {
                        setCurrentList(null);
                        setView("words");
                      }}
                      className="flex-1 flex flex-col items-center justify-center
                        bg-[#2C8C7C]/20 hover:bg-[#2C8C7C]/30 transition-colors
                        border-b border-[#2C8C7C]/40"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Plus className="w-8 h-8 text-[#2C8C7C] mb-2" />
                      <span className="text-gray-800 dark:text-white font-medium">
                        Create New List
                      </span>
                    </motion.button>

                    {/* Add to Existing List Option */}
                    <motion.button
                      onClick={() => setView("existingLists")}
                      className="flex-1 flex flex-col items-center justify-center
                        bg-[#2C8C7C]/15 hover:bg-[#2C8C7C]/25 transition-colors"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <List className="w-8 h-8 text-[#2C8C7C] mb-2" />
                      <span className="text-gray-800 dark:text-white font-medium">
                        Add to Existing List
                      </span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    className="h-full w-full p-6 rounded-xl border border-[#2C8C7C]/40 
                      bg-white/20 dark:bg-gray-800/40 shadow-sm
                      hover:bg-[#2C8C7C]/20 hover:border-[#2C8C7C]/60 
                      transition-all duration-300 
                      flex flex-col items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Book className="w-12 h-12 text-[#2C8C7C] mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                      Words
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                      Create and manage word lists
                    </p>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Canvas Card */}
            <div
              className="relative rounded-xl overflow-hidden"
              onMouseEnter={() => setHoveredCard("canvas")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <AnimatePresence>
                {hoveredCard === "canvas" ? (
                  <motion.button
                    onClick={() => setView("selectLists")}
                    className="absolute inset-0 flex flex-col items-center justify-center
                      bg-[#2C8C7C]/20 hover:bg-[#2C8C7C]/30 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Edit className="w-10 h-10 text-[#2C8C7C] mb-3" />
                    <span className="text-lg text-gray-800 dark:text-white font-medium">
                      Load Words
                    </span>
                  </motion.button>
                ) : (
                  <motion.button
                    className="h-full w-full p-6 rounded-xl border border-[#2C8C7C]/20 
                      bg-white/10 dark:bg-gray-700/30 shadow-sm
                      hover:bg-[#2C8C7C]/10 hover:border-[#2C8C7C]/40 
                      transition-all duration-300 
                      flex flex-col items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Edit className="w-12 h-12 text-[#2C8C7C] mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                      Canvas
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                      Arrange words from your lists
                    </p>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {view === "existingLists" && (
        <ExistingListsView
          onBack={() => setView("options")}
          wordLists={wordLists}
          onSelectList={handleSelectList}
        />
      )}

      {view === "selectLists" && (
        <ListSelectionView
          onBack={() => setView("options")}
          wordLists={wordLists}
          onLoadList={handleLoadListWords}
        />
      )}

      {view === "words" && (
        <WordListView
          onBack={() => setView("options")}
          onSaveList={handleSaveWordList}
          initialList={currentList}
        />
      )}

      {view === "fullScreenCanvas" && (
        <CanvasView
          onBack={() => setView("options")}
          words={loadedWords}
          onSavePoem={onSavePoem}
        />
      )}
    </div>
  );
};

export default DigitalCollage;
