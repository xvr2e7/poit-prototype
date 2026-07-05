import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IconMenu, IconAsk } from "../shared/icons";
import DynamicLogo from "../shared/DynamicLogo";
import { calculateTimeUntilTomorrow } from "../../utils/timeUtils";
import { API_URL } from "../../utils/api";
import MenuView from "./MenuView";
import OnboardingCarousel from "./OnboardingCarousel";
import VersionBadge from "../shared/VersionBadge";

/*
 * The title page of today's edition.
 *
 * POiT prints a new edition every day, so the front door is set like a
 * letterpress title page: printer's mark, masthead, imprint line — and
 * today's actual words scattered faintly around the composition, loose
 * type waiting to be set.
 */

// Deterministic ring positions so the loose type never crowds the masthead
const loosePosition = (i) => {
  const angle = i * 2.4 + 0.9; // golden-angle-ish walk around the ring
  const rx = 34 + ((i * 7) % 3) * 5; // 34–44% from center
  const ry = 30 + ((i * 5) % 3) * 5; // 30–40% from center
  return {
    left: `${50 + Math.cos(angle) * rx}%`,
    top: `${50 + Math.sin(angle) * ry}%`,
  };
};

const HomePage = ({ onStartDaily, onViewHistory }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [looseWords, setLooseWords] = useState([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const updateTime = () => {
      setTimeLeft(calculateTimeUntilTomorrow());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("poit_seen_onboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem("poit_seen_onboarding", "true");
    }
  }, []);

  // Today's words, shown as loose type around the title page
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/words`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.words?.length) return;
        setLooseWords(
          data.words
            .map((w) => (typeof w === "string" ? w : w.text))
            .filter((t) => t && t.length > 2 && t.length < 12)
            .slice(0, 9)
        );
      })
      .catch(() => {}); // the title page works fine without them
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const editionNo = Math.ceil(
    (now - new Date(now.getFullYear(), 0, 0)) / 86400000
  );
  const editionDate = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

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
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center min-h-screen px-6"
          >
            {/* Corner apparatus */}
            <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
              <button
                onClick={() => setMenuOpen(true)}
                className="text-seal/50 hover:text-seal transition-colors"
                aria-label="Open menu"
              >
                <IconMenu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-seal/50 hover:text-seal transition-colors"
                aria-label="How POiT works"
              >
                <IconAsk className="w-5 h-5" />
              </button>
            </div>

            {/* Loose type — today's words, waiting to be set */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
              {looseWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    y: reducedMotion ? 0 : [0, -7, 0],
                  }}
                  transition={{
                    opacity: { duration: 1.6, delay: 1 + i * 0.18 },
                    y: {
                      duration: 9 + (i % 4) * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.7,
                    },
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 font-serif italic
                    text-lg md:text-xl text-ink/[0.22] select-none whitespace-nowrap"
                  style={loosePosition(i)}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Title page */}
            <div className="flex flex-col items-center relative">
              {/* Printer's mark */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mb-6"
              >
                <DynamicLogo size="medium" animate={true} onClick={onStartDaily} />
              </motion.div>

              {/* Imprint line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="flex items-center gap-4 mb-4"
              >
                <span className="w-10 h-px bg-ink/25" />
                <span className="text-label text-seal">
                  a daily poem from found words
                </span>
                <span className="w-10 h-px bg-ink/25" />
              </motion.div>

              {/* Masthead — the i, the poet, is set in jade */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="font-display font-black text-[5.5rem] md:text-[7.5rem]
                  leading-none tracking-[-0.02em] text-ink select-none"
              >
                PO<span className="text-seal">i</span>T
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-4 font-serif italic text-lg text-ink/55"
              >
                words can connect worlds
              </motion.p>

              {/* Begin */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                onClick={onStartDaily}
                className="mt-12 px-8 py-3 bg-seal text-paper rounded-md shadow-leaf
                  dark:shadow-leaf-dark font-mono text-xs tracking-label uppercase
                  hover:bg-seal/90 active:scale-[0.98] transition-transform"
              >
                begin today&apos;s poem
              </motion.button>
            </div>

            {/* Edition colophon */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="absolute bottom-8 font-mono text-[11px] tracking-wide text-ink/40 text-center px-6"
            >
              EDITION No. {editionNo} — {editionDate}
              <span className="text-seal/60 mx-2">·</span>
              new words in {timeLeft.hours}h {timeLeft.minutes}m
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <OnboardingCarousel
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <VersionBadge />
    </div>
  );
};

export default HomePage;
