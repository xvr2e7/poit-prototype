import React from "react";
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Save,
  Share2,
} from "lucide-react";

const ToolBar = ({
  fontSize,
  alignment,
  preview,
  onFontSizeChange,
  onAlignmentChange,
  onPreviewToggle,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onFontSizeChange}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Type className="w-5 h-5" />
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => onAlignmentChange("text-left")}
            className={`p-2 hover:bg-gray-100 rounded-lg ${
              alignment === "text-left" ? "bg-gray-100" : ""
            }`}
          >
            <AlignLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onAlignmentChange("text-center")}
            className={`p-2 hover:bg-gray-100 rounded-lg ${
              alignment === "text-center" ? "bg-gray-100" : ""
            }`}
          >
            <AlignCenter className="w-5 h-5" />
          </button>
          <button
            onClick={() => onAlignmentChange("text-right")}
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
          onClick={onPreviewToggle}
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
  );
};

export default ToolBar;
