import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IconBack } from "./icons";
import Seal from "./Seal";
import { authFetch, getDeviceId } from "../../utils/deviceIdentity";
import { API_URL } from "../../utils/api";

const SharedPoemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchPoem = async () => {
      try {
        const res = await authFetch(`${API_URL}/poems/${id}`);
        if (!res.ok) {
          setError(res.status === 404 ? "Poem not found" : "Failed to load poem");
          return;
        }
        const data = await res.json();
        setPoem(data);
        setLikeCount(data.likeCount || 0);
      } catch {
        setError("Failed to load poem");
      } finally {
        setLoading(false);
      }
    };
    fetchPoem();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await authFetch(`${API_URL}/poems/${id}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount((c) => c + (data.liked ? 1 : -1));
      }
    } catch {
      // silent fail
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-label text-seal/70 animate-pulse">
          unfolding the page…
        </div>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="font-serif italic text-ink/55">
            {error || "This poem isn't here."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-label text-seal hover:underline"
          >
            go home
          </button>
        </div>
      </div>
    );
  }

  // Render every placed component, punctuation included
  const words = poem.components || [];
  const highlightedSet = new Set(
    (poem.selectedWords || []).map((w) => (typeof w === "string" ? w : w.text).toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-seal/70 hover:text-seal transition-colors"
        >
          <IconBack className="w-4 h-4" />
          <span className="text-label">home</span>
        </button>

        {!poem.isOwn && getDeviceId() && (
          <div className="flex items-center gap-2">
            <Seal
              size="sm"
              stamped={liked}
              onClick={handleLike}
              label={liked ? "Remove your seal" : "Stamp your seal on this poem"}
            />
            <span className="font-mono text-xs text-ink/45">
              {likeCount} {likeCount === 1 ? "seal" : "seals"}
            </span>
          </div>
        )}
      </div>

      {/* Poem title */}
      <div className="relative z-10 text-center px-6 mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">
          {poem.title}
        </h1>
        <p className="font-mono text-xs text-ink/40 mt-2">
          {new Date(poem.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Poem canvas */}
      <div className="relative mx-auto" style={{ maxWidth: 800, height: "60vh" }}>
        {words
          .filter((w) => w.position)
          .map((word, i) => {
            const isHighlighted =
              word.type === "word" && highlightedSet.has(word.text.toLowerCase());
            return (
              <motion.div
                key={word.id || `${word.text}-${i}`}
                className="absolute"
                style={{
                  left: word.position.x,
                  top: word.position.y,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 1) }}
              >
                <span
                  className={`font-serif text-base select-none ${
                    word.type === "punctuation"
                      ? "text-ink/50"
                      : isHighlighted
                      ? "text-seal"
                      : "text-ink/80"
                  }`}
                >
                  {word.text}
                </span>
              </motion.div>
            );
          })}
      </div>

      {/* Footer — the maker's mark */}
      <div className="relative z-10 flex flex-col items-center gap-2 py-8">
        <Seal size="sm" />
        <p className="font-mono text-[11px] text-ink/40">
          made with <span className="text-seal">POiT</span> — a poem a day from found words
        </p>
      </div>
    </div>
  );
};

export default SharedPoemPage;
