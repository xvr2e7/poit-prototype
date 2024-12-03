import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Minus } from "lucide-react";

const SortableWord = ({
  id,
  word,
  fontSize,
  preview,
  onDuplicate,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`inline-block m-1 ${fontSize}`}
    >
      <div className="group relative">
        <span className="cursor-move">{word.content}</span>
        {!preview && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:flex space-x-1">
            <button
              onClick={() => onDuplicate(id)}
              className="p-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(id)}
              className="p-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableWord;
