import { useState, useEffect } from "react";

export const useCraftState = (selectedWords, onComplete) => {
  const [words, setWords] = useState([]);
  const [fontSize, setFontSize] = useState("text-base");
  const [alignment, setAlignment] = useState("text-left");
  const [preview, setPreview] = useState(false);

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
    onComplete();
  };

  return {
    words,
    setWords,
    fontSize,
    alignment,
    preview,
    handleFontSizeChange,
    handleAlignmentChange,
    handlePreviewToggle,
    handleComplete,
  };
};
