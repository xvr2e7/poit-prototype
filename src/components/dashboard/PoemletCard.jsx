import React from "react";
import { motion } from "framer-motion";
import { Book } from "lucide-react";

const ActivityGrid = () => {
  const getMonthLabels = () => {
    const months = [];
    const today = new Date();
    for (let i = 2; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(date.toLocaleString("default", { month: "short" }));
    }
    return months;
  };

  const generateMonthData = () => {
    const rows = 7;
    const cols = 5;
    return Array(rows)
      .fill()
      .map(() =>
        Array(cols)
          .fill()
          .map(() => Math.floor(Math.random() * 5))
      );
  };

  const months = getMonthLabels();
  const activityData = months.map((month) => ({
    month,
    days: generateMonthData(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-900 dark:text-gray-100 text-sm">
          Poetic Activity
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-500">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: "#2C8C7C",
                  opacity: 0.1 + level * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500">More</span>
        </div>
      </div>

      <div className="flex gap-6 justify-between py-2">
        {activityData.map(({ month, days }) => (
          <div key={month} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-700 dark:text-gray-300 mb-1">
              {month}
            </span>
            <div className="grid grid-rows-7 gap-1">
              {Array(7)
                .fill()
                .map((_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1">
                    {Array(5)
                      .fill()
                      .map((_, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className="w-2.5 h-2.5 rounded-full transition-transform hover:scale-150"
                          style={{
                            backgroundColor: "#2C8C7C",
                            opacity:
                              0.1 + (days[rowIndex]?.[colIndex] || 0) * 0.2,
                          }}
                        />
                      ))}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PoemletCard = ({ poems = [], onOpen }) => {
  return (
    <div className="space-y-6">
      {/* Poemlet Stats Card */}
      <motion.button
        className="w-full h-48 rounded-2xl overflow-hidden relative group"
        onClick={onOpen}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent 
          dark:from-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 rounded-2xl"
        />

        <div className="relative p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Book className="w-5 h-5 text-[#2C8C7C]" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Poemlet
            </h2>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-900 dark:text-gray-100">
                Poems Created
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {poems.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-900 dark:text-gray-100">
                This Week
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {
                  poems.filter(
                    (p) =>
                      new Date(p.date) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      </motion.button>

      {/* Activity Grid Card */}
      <div
        className="rounded-2xl bg-white/5 backdrop-blur-sm 
        border border-[#2C8C7C]/20 p-6"
      >
        <ActivityGrid />
      </div>
    </div>
  );
};

export default PoemletCard;
