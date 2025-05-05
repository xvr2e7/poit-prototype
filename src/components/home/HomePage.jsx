import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Calendar, HelpCircle } from "lucide-react";
import DynamicLogo from "../shared/DynamicLogo";
import { calculateTimeUntilTomorrow } from "../../utils/timeUtils";
import MenuView from "./MenuView";
import OnboardingCarousel from "./OnboardingCarousel";
import VersionBadge from "../shared/VersionBadge";

const HomePage = ({ onStartDaily, onViewHistory }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false); // State for onboarding

  useEffect(() => {
    const updateTime = () => {
      setTimeLeft(calculateTimeUntilTomorrow());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if it's the first visit and show onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("poit_seen_onboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem("poit_seen_onboarding", "true");
    }
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {menuOpen ? (
          <MenuView
            key="menu-view"
            onClose={() => setMenuOpen(false)}
            onStartDaily={onStartDaily}
            onViewHistory={onViewHistory}
          />
        ) : (
          <motion.div
            key="initial-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            {/* Menu Button */}
            <motion.button
              className="absolute top-6 left-6 p-3 rounded-xl
                bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20
                hover:bg-white/10 transition-colors"
              onClick={toggleMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5 text-[#2C8C7C]" />
            </motion.button>

            {/* Help Button */}
            <motion.button
              className="absolute top-6 left-20 p-3 rounded-xl
                bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20
                hover:bg-white/10 transition-colors"
              onClick={() => setShowOnboarding(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HelpCircle className="w-5 h-5 text-[#2C8C7C]" />
            </motion.button>

            {/* Main Logo */}
            <div className="mb-16 relative flex flex-col items-center">
              <motion.div
                className="relative w-[300px] h-[300px] flex items-center justify-center"
                onClick={onStartDaily}
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
              >
                {/* Animated concentric rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#2C8C7C]/30"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#2C8C7C]/20"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />

                {/* Main pulsing background*/}
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#2C8C7C]/5"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.6, 0.2, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* The logo */}
                <div className="flex items-center justify-center w-full h-full">
                  <DynamicLogo size="large" animate={true} />
                </div>
              </motion.div>
            </div>

            {/* Countdown Box */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 
                  rounded-xl p-4 flex flex-col items-center relative group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Next Words</span>
              </div>
              <p className="text-2xl font-light text-[#2C8C7C]">
                {timeLeft.hours}h {timeLeft.minutes}m
              </p>

              {/* Tooltip that appears to the top-right */}
              <div
                className="absolute top-0 left-full ml-3 -mt-10 w-96 bg-gray-900/90 dark:bg-gray-800/90 
                  backdrop-blur-sm p-3 rounded-lg text-sm text-white shadow-lg
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                  z-10 border border-[#2C8C7C]/30"
              >
                <p>
                  POiT is designed as a one-way daily experience. Once you
                  begin, you'll move through all three phases without returning.
                </p>
                <p className="mt-1 text-xs text-gray-300">
                  In this beta version, the word set for pulse will not refresh
                  daily.
                </p>
                <div
                  className="absolute w-4 h-4 bg-gray-900/90 dark:bg-gray-800/90 transform rotate-45 
                    left-0 top-12 -ml-2 border-l border-b border-[#2C8C7C]/30"
                ></div>
              </div>
            </motion.div>

            {/* Discord Icon Link */}
            <motion.a
              href="https://discord.gg/465FbqkZ5c"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-2 px-4 py-2
                bg-white/5 backdrop-blur-sm border border-[#2C8C7C]/20 
                rounded-lg hover:bg-white/10 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Join our Discord community"
            >
              {/* Discord Icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 71 55"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#2C8C7C]"
              >
                <path
                  d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-[#2C8C7C] text-sm">Join our Discord</span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Carousel */}
      <OnboardingCarousel
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <VersionBadge />
    </div>
  );
};

export default HomePage;
