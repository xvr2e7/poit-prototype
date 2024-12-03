import { useState, useCallback } from "react";

export const useEchoState = () => {
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
  const [filterBy, setFilterBy] = useState("trending");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredNode, setHoveredNode] = useState(null);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleFilter = useCallback((filter) => {
    setFilterBy(filter);
  }, []);

  return {
    graphData,
    selectedNode,
    filterBy,
    searchTerm,
    hoveredNode,
    setHoveredNode,
    handleNodeClick,
    handleSearch,
    handleFilter,
  };
};
