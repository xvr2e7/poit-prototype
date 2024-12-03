import React from "react";
import ForceGraph2D from "react-force-graph-2d";

const GraphVisualization = ({
  graphRef,
  graphData,
  config,
  onNodeClick,
  onNodeHover,
}) => {
  const {
    nodeColor,
    nodeLabel,
    nodeRelSize,
    linkLabel,
    linkColor,
    linkWidth,
    linkDirectionalParticles,
    linkDirectionalParticleSpeed,
  } = config;

  return (
    <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="w-full h-[70vh]">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeColor={nodeColor}
          nodeLabel={nodeLabel}
          nodeRelSize={nodeRelSize}
          linkLabel={linkLabel}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkDirectionalParticles={linkDirectionalParticles}
          linkDirectionalParticleSpeed={linkDirectionalParticleSpeed}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
        />
      </div>
    </div>
  );
};

export default GraphVisualization;
