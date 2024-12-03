import { useCallback, useRef } from "react";

export const useGraphLayout = () => {
  const graphRef = useRef();

  const handleNodeClick = useCallback((node) => {
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
  }, []);

  const config = {
    nodeColor: (node) =>
      node.selected ? "#3b82f6" : node.hovered ? "#60a5fa" : "#94a3b8",
    nodeLabel: (node) => `${node.title} by ${node.author}`,
    nodeRelSize: 8,
    linkLabel: (link) => link.word,
    linkColor: () => "#cbd5e1",
    linkWidth: 2,
    linkDirectionalParticles: 2,
    linkDirectionalParticleSpeed: 0.005,
  };

  return {
    graphRef,
    config,
    handleNodeClick,
  };
};
