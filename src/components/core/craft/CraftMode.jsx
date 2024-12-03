import React from "react";
import ToolBar from "./components/ToolBar";
import WordCanvas from "./components/WordCanvas";
import { useCraftState } from "./hooks/useCraftState";

const CraftMode = ({ onComplete, selectedWords = [] }) => {
  const {
    words,
    fontSize,
    alignment,
    preview,
    handleFontSizeChange,
    handleAlignmentChange,
    handlePreviewToggle,
    handleWordUpdate,
    handleComplete,
  } = useCraftState(selectedWords, onComplete);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <ToolBar
          fontSize={fontSize}
          alignment={alignment}
          preview={preview}
          onFontSizeChange={handleFontSizeChange}
          onAlignmentChange={handleAlignmentChange}
          onPreviewToggle={handlePreviewToggle}
        />

        <WordCanvas
          words={words}
          fontSize={fontSize}
          alignment={alignment}
          preview={preview}
          onWordUpdate={handleWordUpdate}
        />

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleComplete}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Complete Poem
          </button>
        </div>
      </div>
    </div>
  );
};

export default CraftMode;
