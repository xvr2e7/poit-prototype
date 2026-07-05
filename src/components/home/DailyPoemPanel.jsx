import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { poetryService } from "../../utils/poetryService";

const LoadingAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex items-center justify-center"
  >
    <div className="flex gap-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-seal/30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </motion.div>
);

const DailyPoemPanel = () => {
  const [poem, setPoem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchDailyPoem = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const dailyPoem = await poetryService.getDailyPoem();
        setPoem(dailyPoem);
      } catch (error) {
        console.error("Error fetching daily poem:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDailyPoem();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <div
        className="flex-1 mx-4 md:mx-12 mt-6 mb-12 rounded-2xl relative overflow-hidden
          bg-surface/70 border border-ink/10"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingAnimation />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full relative"
            >
              {/* Scrollable poem content */}
              <div className="h-[520px] overflow-y-auto scrollbar-thin px-12 pt-8 pb-24">
                <div className="space-y-7">
                  {poem?.lines.map((line, i) => (
                    <motion.div
                      key={i}
                      className="relative"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    >
                      <h2 className="font-serif text-lg font-light leading-relaxed text-ink/75">
                        {line}
                      </h2>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Metadata section */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-surface border-t border-ink/10"
                animate={{
                  opacity: isHovering ? 0.1 : 1,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
              >
                <div className="py-4 px-5">
                  <h3 className="font-serif text-base text-ink">
                    {poem?.title}
                  </h3>
                  <p className="font-mono text-xs text-ink/50 mt-1">
                    by {poem?.author}
                  </p>
                  {/* <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    &copy;Poem-a-Day, by the Academy of American Poets.
                  </p> */}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailyPoemPanel;
