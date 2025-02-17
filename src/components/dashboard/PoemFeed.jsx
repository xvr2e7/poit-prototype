import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const SAMPLE_POEMS = [
  {
    id: 1,
    title: "The Road Not Taken",
    author: "Robert Frost",
    preview: "Two roads diverged in a yellow wood...",
    type: "classic",
  },
  {
    id: 2,
    title: "The Microwave's Mournful Hymn",
    author: "FP",
    preview: "What is the self but a draft unsent...",
    type: "contemporary",
  },
];

const PoemCard = ({ poem }) => (
  <motion.div
    className="p-6 rounded-xl bg-white/5 backdrop-blur-sm 
      border border-[#2C8C7C]/20 group hover:bg-white/10 
      transition-colors cursor-pointer"
    whileHover={{ y: -2 }}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {poem.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          by {poem.author}
        </p>
      </div>
      <motion.button
        className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-500
          transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Star className="w-4 h-4" />
      </motion.button>
    </div>
    <p className="text-gray-900 dark:text-gray-100 text-sm line-clamp-2">
      {poem.preview}
    </p>
  </motion.div>
);

const PoemFeed = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState("discover");

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
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-500"
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
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-500"
              }`}
            onClick={() => setActiveTab("saved")}
          >
            Saved
          </button>
        </div>
      </div>

      {/* Feed content */}
      <div className="space-y-4">
        {SAMPLE_POEMS.map((poem) => (
          <PoemCard key={poem.id} poem={poem} />
        ))}
      </div>

      {/* Load more */}
      <button className="w-full mt-4 py-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-gray-500 transition-colors">
        Load More
      </button>
    </div>
  );
};

export default PoemFeed;
