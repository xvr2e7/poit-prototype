import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Plus, Minus } from "lucide-react";

const WordCard = ({
  word,
  index,
  fontSize,
  preview,
  onDuplicate,
  onRemove,
}) => {
  return (
    <Draggable draggableId={word.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`inline-block m-1 ${fontSize} ${
            snapshot.isDragging ? "opacity-50" : ""
          }`}
        >
          <div className="group relative">
            <span className="cursor-move">{word.content}</span>
            {!preview && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:flex space-x-1">
                <button
                  onClick={onDuplicate}
                  className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={onRemove}
                  className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default WordCard;
