import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconClose,
  IconMenu,
  IconPencil,
  IconPlus,
  IconPoemlet,
} from "../shared/icons";
import CanvasView from "./CanvasView";

const ExistingListsView = ({ onBack, wordLists, onSelectList }) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-paper">Select a List</h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-seal/10 text-paper"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      {wordLists.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {wordLists.map((list) => (
            <motion.button
              key={list.name}
              onClick={() => onSelectList(list)}
              className="p-4 rounded-lg border border-seal/40 
                bg-surface 
                hover:bg-seal/20 hover:border-seal/60 
                transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <h4 className="text-lg font-medium text-ink mb-1">
                {list.name}
              </h4>
              <p className="text-sm text-ink/70">
                {list.words.length} words
              </p>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink/40">
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
        <h3 className="text-xl font-medium text-paper">Select Lists</h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-seal/10 text-paper"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      {wordLists.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {wordLists.map((list) => (
              <motion.div
                key={list.name}
                className="flex items-center p-3 border border-seal/30 rounded-lg"
                whileHover={{ backgroundColor: "rgb(var(--ink) / 0.1)" }}
              >
                <input
                  type="checkbox"
                  id={`select-${list.name}`}
                  checked={selectedLists.includes(list.name)}
                  onChange={() => toggleList(list.name)}
                  className="mr-3 h-5 w-5 accent-seal"
                />
                <label
                  htmlFor={`select-${list.name}`}
                  className="flex-1 cursor-pointer"
                >
                  <h4 className="text-base font-medium text-ink">
                    {list.name}
                  </h4>
                  <p className="text-sm text-ink/70">
                    {list.words.length} words
                  </p>
                </label>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-ink/40">
            No word lists available. Create a new list first.
          </p>
        </div>
      )}

      <motion.button
        onClick={handleLoadLists}
        disabled={selectedLists.length === 0}
        className={`mt-4 w-full py-3 rounded-lg transition-colors ${
          selectedLists.length === 0
            ? "bg-ink/20 text-ink/70 cursor-not-allowed"
            : "bg-seal hover:bg-seal/90 text-paper font-medium shadow-sm"
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
        <h3 className="text-xl font-medium text-paper">
          {initialList ? "Edit Word List" : "Create Word List"}
        </h3>
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-seal/10 text-paper"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-ink font-medium mb-1">
          List Name
        </label>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full p-2 rounded-lg border border-seal/40 
            bg-surface 
            text-ink
            focus:border-seal focus:outline-none focus:ring-1 focus:ring-seal/60"
          placeholder="Enter list name..."
        />
      </div>

      <div className="mb-4 flex">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddWord()}
          className="flex-1 p-2 rounded-l-lg border border-seal/40 
            bg-surface 
            text-ink
            focus:border-seal focus:outline-none focus:ring-1 focus:ring-seal/60"
          placeholder="Enter a word..."
        />
        <motion.button
          onClick={handleAddWord}
          className="px-4 py-2 rounded-r-lg bg-seal hover:bg-seal/90 
            text-paper font-medium shadow-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add
        </motion.button>
      </div>

      <div
        className="flex-1 overflow-y-auto border border-seal/40 rounded-lg 
        p-4 bg-surface mb-4"
      >
        {wordList.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {wordList.map((word, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg 
                  bg-surface 
                  border border-seal/30 dark:border-seal/40"
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                }}
              >
                <span className="text-ink/85">{word}</span>
                <motion.button
                  onClick={() => handleRemoveWord(index)}
                  className="p-1 rounded-full hover:bg-seal/10 
                    text-ink/50 
                    hover:text-seal dark:hover:text-seal"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <IconClose className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-ink/40">
            Add words to your list
          </div>
        )}
      </div>

      <motion.button
        onClick={handleSave}
        disabled={!listName.trim() || wordList.length === 0}
        className={`w-full py-3 rounded-lg transition-colors ${
          !listName.trim() || wordList.length === 0
            ? "bg-ink/15 text-ink/70 cursor-not-allowed"
            : "bg-seal hover:bg-seal/90 text-paper font-medium shadow-sm"
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
            <h3 className="text-xl font-medium text-seal">
              Digital Collage
            </h3>
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-seal/10 text-seal"
            >
              <IconClose className="w-5 h-5" />
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
                        bg-seal/20 hover:bg-seal/30 transition-colors
                        border-b border-seal/40"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <IconPlus className="w-8 h-8 text-seal mb-2" />
                      <span className="text-ink/85 font-medium">
                        Create New List
                      </span>
                    </motion.button>

                    {/* Add to Existing List Option */}
                    <motion.button
                      onClick={() => setView("existingLists")}
                      className="flex-1 flex flex-col items-center justify-center
                        bg-seal/15 hover:bg-seal/25 transition-colors"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <IconMenu className="w-8 h-8 text-seal mb-2" />
                      <span className="text-ink/85 font-medium">
                        Add to Existing List
                      </span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    className="h-full w-full p-6 rounded-xl border border-seal/40 
                      bg-surface shadow-sm
                      hover:bg-seal/20 hover:border-seal/60 
                      transition-all duration-300 
                      flex flex-col items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconPoemlet className="w-12 h-12 text-seal mb-4" />
                    <h3 className="text-lg font-medium text-ink/85 mb-2">
                      Words
                    </h3>
                    <p className="text-sm text-ink/60 text-center">
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
                      bg-seal/20 hover:bg-seal/30 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <IconPencil className="w-10 h-10 text-seal mb-3" />
                    <span className="text-lg text-ink/85 font-medium">
                      Load Words
                    </span>
                  </motion.button>
                ) : (
                  <motion.button
                    className="h-full w-full p-6 rounded-xl border border-seal/20 
                      bg-surface shadow-sm
                      hover:bg-seal/10 hover:border-seal/40 
                      transition-all duration-300 
                      flex flex-col items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconPencil className="w-12 h-12 text-seal mb-4" />
                    <h3 className="text-lg font-medium text-ink/85 mb-2">
                      Canvas
                    </h3>
                    <p className="text-sm text-ink/60 text-center">
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
