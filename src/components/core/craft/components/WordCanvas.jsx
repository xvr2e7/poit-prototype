import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import WordCard from "./WordCard";

const WordCanvas = ({ words, fontSize, alignment, preview, onWordUpdate }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onWordUpdate("reorder", {
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index,
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-8 min-h-[600px] ${alignment}`}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="poetry-canvas">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="min-h-[500px]"
            >
              {words.map((word, index) => (
                <WordCard
                  key={word.id}
                  word={word}
                  index={index}
                  fontSize={fontSize}
                  preview={preview}
                  onDuplicate={() =>
                    onWordUpdate("duplicate", { wordId: word.id })
                  }
                  onRemove={() => onWordUpdate("remove", { wordId: word.id })}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default WordCanvas;
