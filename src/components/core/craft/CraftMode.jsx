import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Save,
  Share2,
  Eye,
  Plus,
  Minus,
  Type,
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react";

const CraftMode = ({
  onComplete,
  selectedWords = ["ethereal", "whisper", "cascade", "luminous", "serenity"],
}) => {
  const [words, setWords] = useState([]);
  const [fontSize, setFontSize] = useState("text-base");
  const [alignment, setAlignment] = useState("text-left");
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    // Initialize words with position data
    setWords(
      selectedWords.map((word, index) => ({
        id: `word-${index}`,
        content: word,
        x: 0,
        y: index * 40,
      }))
    );
  }, [selectedWords]);

  const handleDragEnd = (result) => {
    setIsDragging(false);
    if (!result.destination) return;

    const items = Array.from(words);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWords(items);
  };

  const duplicateWord = (wordId) => {
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
  };

  const removeWord = (wordId) => {
    setWords(words.filter((w) => w.id !== wordId));
  };

  const togglePreview = () => setPreview(!preview);

  const handleComplete = () => {
    // Save poem logic here
    onComplete();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                setFontSize((prev) =>
                  prev === "text-base" ? "text-lg" : "text-base"
                )
              }
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Type className="w-5 h-5" />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setAlignment("text-left")}
                className={`p-2 hover:bg-gray-100 rounded-lg ${
                  alignment === "text-left" ? "bg-gray-100" : ""
                }`}
              >
                <AlignLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setAlignment("text-center")}
                className={`p-2 hover:bg-gray-100 rounded-lg ${
                  alignment === "text-center" ? "bg-gray-100" : ""
                }`}
              >
                <AlignCenter className="w-5 h-5" />
              </button>
              <button
                onClick={() => setAlignment("text-right")}
                className={`p-2 hover:bg-gray-100 rounded-lg ${
                  alignment === "text-right" ? "bg-gray-100" : ""
                }`}
              >
                <AlignRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={togglePreview}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Save className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          className={`bg-white rounded-lg shadow-md p-8 min-h-[600px] ${alignment}`}
        >
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
          >
            <Droppable droppableId="poetry-canvas">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[500px]"
                >
                  {words.map((word, index) => (
                    <Draggable
                      key={word.id}
                      draggableId={word.id}
                      index={index}
                    >
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
                                  onClick={() => duplicateWord(word.id)}
                                  className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeWord(word.id)}
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
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Action Button */}
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
