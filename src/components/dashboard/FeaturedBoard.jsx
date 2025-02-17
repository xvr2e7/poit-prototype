import React from "react";
import { motion } from "framer-motion";
import { Pin } from "lucide-react";

const PoemCard = ({ poem, isPinned }) => (
  <motion.div
    className="relative rounded-xl overflow-hidden bg-white/5 
      backdrop-blur-sm border border-[#2C8C7C]/20 group"
    whileHover={{ scale: 1.02 }}
  >
    {isPinned && (
      <div className="absolute top-3 right-3 text-[#2C8C7C]">
        <Pin className="w-4 h-4" />
      </div>
    )}
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {poem.title}
      </h3>
      <p className="text-sm text-gray-900 dark:text-gray-100 mb-4 line-clamp-2">
        {poem.preview}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-500">{poem.date}</span>
        <span className="text-gray-500 dark:text-gray-500">
          {poem.connections} connections
        </span>
      </div>
    </div>
  </motion.div>
);

const FeaturedBoard = ({ poems = [], className = "" }) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
          Featured Poems
        </h2>
        <button
          className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-500]
          transition-colors"
        >
          Customize Board
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {poems.map((poem) => (
          <PoemCard key={poem.id} poem={poem} isPinned={poem.isPinned} />
        ))}
        {poems.length === 0 && (
          <div className="col-span-2 text-center py-12 text-[#2C8C7C]/60">
            Pin your favorite poems here to showcase them.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedBoard;
