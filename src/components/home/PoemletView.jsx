import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBack,
  IconCheck,
  IconLink,
  IconNib,
} from "../shared/icons";
import Seal from "../shared/Seal";

/**
 * Poemlet — the poet's own chapbook.
 * Every completed daily poem is kept here, one leaf per poem.
 */

// Scale a poem's absolute word layout to fit its frame
const PoemLeaf = ({ poem }) => {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(1);

  const components = poem.components || poem.words || [];
  const placed = components.filter((c) => c.position);

  const bounds = useMemo(() => {
    if (placed.length === 0) return { minX: 0, minY: 0, width: 1, height: 1 };
    const xs = placed.map((c) => c.position.x);
    const ys = placed.map((c) => c.position.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return {
      minX,
      minY,
      width: Math.max(...xs) - minX + 160,
      height: Math.max(...ys) - minY + 80,
    };
  }, [placed]);

  useEffect(() => {
    const fit = () => {
      if (!frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      setScale(
        Math.min(rect.width / bounds.width, rect.height / bounds.height, 1)
      );
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [bounds]);

  const highlighted = new Set(
    (poem.selectedWords || []).map((w) =>
      (typeof w === "string" ? w : w.text).toLowerCase()
    )
  );

  return (
    <div
      ref={frameRef}
      className="relative w-full h-[55vh] rounded-xl bg-surface border border-ink/10 overflow-hidden"
    >
      <div
        className="absolute left-6 top-6 origin-top-left font-serif"
        style={{ transform: `scale(${scale})` }}
      >
        {placed.map((word, i) => (
          <motion.span
            key={word.id || `${word.text}-${i}`}
            className={`absolute whitespace-nowrap ${
              word.type === "punctuation"
                ? "text-ink/50"
                : highlighted.has(word.text?.toLowerCase())
                ? "text-seal"
                : "text-ink/80"
            }`}
            style={{
              left: word.position.x - bounds.minX,
              top: word.position.y - bounds.minY,
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.8) }}
          >
            {word.text || word.content}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

const PoemletView = () => {
  const navigate = useNavigate();
  const [poems, setPoems] = useState([]);
  const [openPoem, setOpenPoem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    try {
      const history = JSON.parse(
        localStorage.getItem("poit_poems_history") || "[]"
      );
      setPoems(history);
    } catch {
      setPoems([]);
    }
  }, []);

  const handleCopyLink = async (poem) => {
    if (!poem.serverId) return;
    const url = `${window.location.origin}/poem/${poem.serverId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(poem.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const wordCount = (poem) =>
    (poem.components || poem.words || []).filter((c) => c.type === "word")
      .length;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => (openPoem ? setOpenPoem(null) : navigate(-1))}
            className="flex items-center gap-2 text-seal/70 hover:text-seal transition-colors"
          >
            <IconBack className="w-4 h-4" />
            <span className="text-label">
              {openPoem ? "back to poemlet" : "back"}
            </span>
          </button>
          <span className="text-label text-ink/35">
            {poems.length} {poems.length === 1 ? "poem" : "poems"} kept
          </span>
        </div>

        <AnimatePresence mode="wait">
          {openPoem ? (
            /* ——— Single leaf ——— */
            <motion.div
              key="leaf"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="flex items-baseline justify-between mb-4">
                <h1 className="font-serif text-3xl font-light text-ink">
                  {openPoem.title}
                </h1>
                <span className="font-mono text-xs text-ink/40">
                  {openPoem.date}
                </span>
              </div>
              <PoemLeaf poem={openPoem} />
              {openPoem.serverId && (
                <button
                  onClick={() => handleCopyLink(openPoem)}
                  className="mt-4 flex items-center gap-1.5 text-seal/70 hover:text-seal transition-colors"
                >
                  {copiedId === openPoem.id ? (
                    <IconCheck className="w-3.5 h-3.5" />
                  ) : (
                    <IconLink className="w-3.5 h-3.5" />
                  )}
                  <span className="text-label">
                    {copiedId === openPoem.id ? "link copied" : "share this poem"}
                  </span>
                </button>
              )}
            </motion.div>
          ) : (
            /* ——— Index of leaves ——— */
            <motion.div
              key="index"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="font-serif text-4xl font-light text-ink mb-2">
                Poemlet
              </h1>
              <p className="font-serif italic text-ink/50 mb-10">
                every poem you have finished, kept in one small book
              </p>

              {poems.length === 0 ? (
                <div className="py-20 text-center space-y-6">
                  <IconNib className="w-8 h-8 mx-auto text-ink/20" />
                  <p className="font-serif italic text-ink/50">
                    The pages are still blank.
                  </p>
                  <button
                    onClick={() => navigate("/pulse")}
                    className="px-5 py-2.5 rounded-lg bg-seal text-paper
                      font-mono text-xs tracking-wide hover:bg-seal/90 transition-colors"
                  >
                    Write today&apos;s poem
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {poems.map((poem, i) => (
                    <li key={poem.id || i}>
                      <button
                        onClick={() => setOpenPoem(poem)}
                        className="w-full flex items-baseline justify-between gap-4 py-4
                          text-left group hover:bg-seal/5 rounded-md px-3 -mx-3 transition-colors"
                      >
                        <span className="font-serif text-lg text-ink group-hover:text-seal transition-colors">
                          {poem.title || "Untitled"}
                        </span>
                        <span className="flex items-center gap-4 shrink-0 font-mono text-xs text-ink/40">
                          <span>{wordCount(poem)} words</span>
                          <span>{poem.date}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PoemletView;
