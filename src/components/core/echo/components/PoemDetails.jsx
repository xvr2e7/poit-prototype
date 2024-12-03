import React from "react";
import { Calendar, Star, Info } from "lucide-react";

const PoemDetails = ({ selectedNode, graphData }) => {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Info className="h-12 w-12 mb-2" />
          <p>Select a poem to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-2">{selectedNode.title}</h2>
      <p className="text-gray-600 mb-4">by {selectedNode.author}</p>
      <div className="flex items-center space-x-4 text-gray-500 text-sm mb-4">
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {selectedNode.date}
        </span>
        <span className="flex items-center">
          <Star className="h-4 w-4 mr-1" />
          {selectedNode.likes} likes
        </span>
      </div>
      <h3 className="font-semibold mb-2">Shared Words:</h3>
      <div className="flex flex-wrap gap-2">
        {graphData.links
          .filter(
            (link) =>
              link.source === selectedNode.id || link.target === selectedNode.id
          )
          .map((link, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
            >
              {link.word}
            </span>
          ))}
      </div>
    </div>
  );
};

export default PoemDetails;
