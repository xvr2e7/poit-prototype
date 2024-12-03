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
        x: 0,
        y: index * 40,
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

  const handleWordUpdate = (action, payload) => {
    switch (action) {
      case "reorder": {
        const { sourceIndex, destinationIndex } = payload;
        const items = Array.from(words);
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(destinationIndex, 0, reorderedItem);
        setWords(items);
        break;
      }
      case "duplicate": {
        const { wordId } = payload;
        const wordToDuplicate = words.find((w) => w.id === wordId);
        if (wordToDuplicate) {
          setWords([
            ...words,
            {
              ...wordToDuplicate,
              id: `word-${words.length}`,
              y: wordToDuplicate.y + 20,
            },
          ]);
        }
        break;
      }
      case "remove": {
        const { wordId } = payload;
        setWords(words.filter((w) => w.id !== wordId));
        break;
      }
      default:
        break;
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return {
    words,
    fontSize,
    alignment,
    preview,
    handleFontSizeChange,
    handleAlignmentChange,
    handlePreviewToggle,
    handleWordUpdate,
    handleComplete,
  };
};
