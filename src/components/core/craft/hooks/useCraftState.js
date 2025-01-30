import { useState, useEffect } from "react";

export const useCraftState = (selectedWords, onComplete) => {
  const [words, setWords] = useState([]);
  const [fontSize, setFontSize] = useState("text-base");
  const [alignment, setAlignment] = useState("text-left");
  const [preview, setPreview] = useState(false);
  const [canvasWords, setCanvasWords] = useState([]);

  useEffect(() => {
    setWords(
      selectedWords.map((word, index) => ({
        id: `word-${index}`,
        content: word,
      }))
    );
  }, [selectedWords]);

  const handleFontSizeChange = () => {
    setFontSize((prev) => (prev === "text-base" ? "text-lg" : "text-base"));
  };

  const handleAlignmentChange = (newAlignment) => {
    setAlignment(newAlignment);
  };

  const handlePreviewToggle = () => {
    setPreview((prev) => !prev);
  };

  const handleComplete = () => {
    // Create a properly structured poem object
    const poemData = {
      words: canvasWords, // Using the current canvas words
      metadata: {
        fontSize,
        alignment,
      },
      components: canvasWords.map((word) => ({
        ...word,
        type: "word",
      })),
    };
    onComplete(poemData);
  };

  return {
    words,
    setWords,
    canvasWords,
    setCanvasWords,
    fontSize,
    alignment,
    preview,
    handleFontSizeChange,
    handleAlignmentChange,
    handlePreviewToggle,
    handleComplete,
  };
};
