import React, { useState, useCallback, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Search, Filter, TrendingUp, Calendar, Star, Info } from "lucide-react";

const EchoMode = ({ onComplete, playgroundUnlocked, enterPlayground }) => {
  
  const [graphData] = useState({
    nodes: [
      {
        id: "poem1",
        title: "Whispers of Dawn",
        author: "User1",
        date: "2024-03-15",
        likes: 45,
      },
      {
        id: "poem2",
        title: "Ethereal Dreams",
        author: "User2",
        date: "2024-03-14",
        likes: 32,
      },
      {
        id: "poem3",
        title: "Cascading Thoughts",
        author: "User3",
        date: "2024-03-13",
        likes: 28,
      },
      {
        id: "poem4",
        title: "Luminous Night",
        author: "User4",
        date: "2024-03-12",
        likes: 56,
      },
      {
        id: "poem5",
        title: "Velvet Silence",
        author: "User5",
        date: "2024-03-11",
        likes: 41,
      },
    ],
    links: [
      { source: "poem1", target: "poem2", word: "ethereal" },
      { source: "poem2", target: "poem3", word: "cascade" },
      { source: "poem3", target: "poem4", word: "luminous" },
      { source: "poem1", target: "poem4", word: "whisper" },
      { source: "poem4", target: "poem5", word: "velvet" },
    ],
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [filterBy, setFilterBy] = useState("trending"); // trending, recent, popular
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredNode, setHoveredNode] = useState(null);

  const graphRef = useRef();

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="w-full h-full flex flex-col p-4">
        {/* Header with controls */}
        <div className="w-full bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search poems..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <button
                onClick={() => setFilterBy("trending")}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                  filterBy === "trending"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </button>
              <button
                onClick={() => setFilterBy("recent")}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                  filterBy === "recent"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Recent</span>
              </button>
              <button
                onClick={() => setFilterBy("popular")}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                  filterBy === "popular"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <Star className="h-4 w-4" />
                <span>Popular</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 gap-4">
          {/* Graph container */}
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="w-full h-[70vh]">
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel={(node) => `${node.title} by ${node.author}`}
                nodeColor={(node) =>
                  node === selectedNode
                    ? "#3b82f6"
                    : node === hoveredNode
                    ? "#60a5fa"
                    : "#94a3b8"
                }
                nodeRelSize={8}
                linkLabel={(link) => link.word}
                linkColor={() => "#cbd5e1"}
                onNodeClick={handleNodeClick}
                onNodeHover={setHoveredNode}
                linkWidth={2}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
              />
            </div>
          </div>

          {/* Sidebar - Selected poem details */}
          <div className="w-80 bg-white rounded-lg shadow-md p-4">
            {selectedNode ? (
              <div>
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
                        link.source === selectedNode.id ||
                        link.target === selectedNode.id
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Info className="h-12 w-12 mb-2" />
                <p>Select a poem to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Complete Echo
          </button>
          {playgroundUnlocked && (
            <button
              onClick={enterPlayground}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Enter Playground
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EchoMode;
