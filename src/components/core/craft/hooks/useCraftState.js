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
        type: "word",
        capitalization: "none",
      }))
    );
  }, [selectedWords]);

  const handleSignatureAdd = (signature) => {
    const newSignature = {
      id: `signature-${Date.now()}`,
      text: signature,
      type: "signature",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
      },
    };
    setCanvasWords((prev) => [...prev, newSignature]);
  };

  const handleCapitalizationChange = (selectedWordId) => {
    if (!selectedWordId) return;

    setCanvasWords((prev) =>
      prev.map((word) => {
        if (word.id === selectedWordId && word.type === "word") {
          const nextState = {
            none: "first",
            first: "all",
            all: "none",
          }[word.capitalization || "none"];

          return {
            ...word,
            capitalization: nextState,
            originalText: word.originalText || word.text,
          };
        }
        return word;
      })
    );
  };

  const handlePunctuationSelect = (symbol) => {
    const newPunctuation = {
      id: `punct-${Date.now()}`,
      text: symbol,
      type: "punctuation",
      position: {
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
    };
    setCanvasWords((prev) => [...prev, newPunctuation]);
  };

  const handlePreviewToggle = () => {
    setPreview((prev) => !prev);
  };

  const handleComplete = () => {
    const poemData = {
      words: canvasWords,
      metadata: {
        fontSize,
        alignment,
      },
      components: canvasWords.map((word) => ({
        ...word,
        type: word.type,
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
    handleCapitalizationChange,
    handlePunctuationSelect,
    handleSignatureAdd,
    handlePreviewToggle: () => setPreview((prev) => !prev),
    handleComplete,
  };
};
