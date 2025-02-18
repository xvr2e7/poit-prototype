import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader, RotateCw } from "lucide-react";
import { poetryService } from "../../../server/src/services/poetryService";
import PoemModal from "./PoemModal";

const PoemCard = ({ poem, onSave, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm 
      border border-[#2C8C7C]/20 overflow-hidden cursor-pointer 
      hover:bg-white/10 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-2xl text-gray-800 dark:text-gray-200">
          {poem.title}
        </h3>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
          by {poem.author}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSave(poem);
        }}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 
          hover:text-[#2C8C7C] transition-colors"
      >
        <Star className="w-5 h-5" />
      </button>
    </div>

    <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
      {poem.lines?.slice(0, 2).join(" ")}...
    </div>
  </motion.div>
);

const PoemFeed = ({ className = "" }) => {
  const [currentPoem, setCurrentPoem] = useState(null);
  const [savedPoems, setSavedPoems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discover");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [expandedPoem, setExpandedPoem] = useState(null);

  const fetchNewPoem = async () => {
    try {
      setIsRegenerating(true);
      const poems = await poetryService.getPoems(1, 1);
      setCurrentPoem(poems[0]); // We already have the full poem here
    } catch (error) {
      console.error("Error fetching poem:", error);
    } finally {
      setIsRegenerating(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewPoem();
  }, []);

  const handleSavePoem = (poem) => {
    setSavedPoems((prev) => {
      const exists = prev.some((p) => p.id === poem.id);
      if (exists) {
        return prev.filter((p) => p.id !== poem.id);
      }
      return [...prev, poem];
    });
  };

  const handlePoemClick = (poem) => {
    setExpandedPoem(poem);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
          Poetry Feed
        </h2>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm transition-colors
              ${
                activeTab === "discover"
                  ? "bg-[#2C8C7C]/10 text-[#2C8C7C]"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            onClick={() => setActiveTab("discover")}
          >
            Discover
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm transition-colors
              ${
                activeTab === "saved"
                  ? "bg-[#2C8C7C]/10 text-[#2C8C7C]"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            onClick={() => setActiveTab("saved")}
          >
            Saved ({savedPoems.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <Loader className="w-6 h-6 text-[#2C8C7C] animate-spin" />
            </motion.div>
          ) : activeTab === "discover" ? (
            <PoemCard
              poem={currentPoem}
              onSave={handleSavePoem}
              onClick={() => handlePoemClick(currentPoem)}
            />
          ) : savedPoems.length > 0 ? (
            savedPoems.map((poem) => (
              <PoemCard
                key={poem.id}
                poem={poem}
                onSave={handleSavePoem}
                onClick={() => handlePoemClick(poem)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              No saved poems yet. Discover and save poems to see them here.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Regenerate button */}
        {activeTab === "discover" && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <button
              onClick={fetchNewPoem}
              disabled={isRegenerating}
              className="p-4 rounded-full bg-[#2C8C7C]/10 text-[#2C8C7C] 
                hover:bg-[#2C8C7C]/20 transition-colors group"
            >
              <RotateCw
                className={`w-6 h-6 ${
                  isRegenerating
                    ? "animate-spin"
                    : "group-hover:rotate-180 transition-transform duration-500"
                }`}
              />
            </button>
          </motion.div>
        )}
      </div>

      {/* Expanded Poem Modal */}
      <PoemModal
        poem={expandedPoem}
        isOpen={!!expandedPoem}
        onClose={() => setExpandedPoem(null)}
        onSave={handleSavePoem}
      />
    </div>
  );
};

export default PoemFeed;
