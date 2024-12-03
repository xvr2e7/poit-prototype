import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
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
    setWords,
    handleComplete,
  } = useCraftState(selectedWords, onComplete);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWords((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDuplicate = (wordId) => {
    setWords((words) => {
      const wordToDuplicate = words.find((w) => w.id === wordId);
      if (wordToDuplicate) {
        return [
          ...words,
          {
            ...wordToDuplicate,
            id: `word-${words.length}`,
          },
        ];
      }
      return words;
    });
  };

  const handleRemove = (wordId) => {
    setWords((words) => words.filter((w) => w.id !== wordId));
  };

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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <WordCanvas
            words={words}
            fontSize={fontSize}
            alignment={alignment}
            preview={preview}
            onDuplicate={handleDuplicate}
            onRemove={handleRemove}
          />
        </DndContext>

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
