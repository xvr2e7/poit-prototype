import React from "react";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableWord from "./SortableWord";

const WordCanvas = ({
  words,
  fontSize,
  alignment,
  preview,
  onDuplicate,
  onRemove,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-8 min-h-[600px] ${alignment}`}
    >
      <SortableContext
        items={words.map((w) => w.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="min-h-[500px]">
          {words.map((word) => (
            <SortableWord
              key={word.id}
              id={word.id}
              word={word}
              fontSize={fontSize}
              preview={preview}
              onDuplicate={onDuplicate}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default WordCanvas;
