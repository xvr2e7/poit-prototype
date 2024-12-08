import React from "react";
import SearchControls from "./components/SearchControls";
import PoemDetails from "./components/PoemDetails";
import GraphVisualization from "./components/GraphVisualization";
import ControlBar from "./components/ControlBar";
import EchoBackground from "./components/EchoBackground";
import { useEchoState } from "./hooks/useEchoState";
import { useGraphLayout } from "./hooks/useGraphLayout";

const EchoMode = ({ onComplete, playgroundUnlocked, enterPlayground }) => {
  const {
    graphData,
    selectedNode,
    filterBy,
    searchTerm,
    hoveredNode,
    setHoveredNode,
    handleNodeClick,
    handleSearch,
    handleFilter,
  } = useEchoState();

  const {
    graphRef,
    config,
    handleNodeClick: handleGraphNodeClick,
  } = useGraphLayout();

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-transparent">
      <EchoBackground />

      <div className="relative z-10 w-full h-full flex flex-col p-4">
        <div className="max-w-6xl mx-auto w-full space-y-4">
          <SearchControls
            filterBy={filterBy}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onFilterChange={handleFilter}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <GraphVisualization
                graphRef={graphRef}
                graphData={graphData}
                config={{
                  ...config,
                  nodeColor: (node) =>
                    node.selected
                      ? "rgba(59, 130, 246, 0.8)"
                      : node.hovered
                      ? "rgba(96, 165, 250, 0.8)"
                      : "rgba(148, 163, 184, 0.6)",
                  linkColor: () => "rgba(203, 213, 225, 0.2)",
                }}
                onNodeClick={(node) => {
                  handleNodeClick(node);
                  handleGraphNodeClick(node);
                }}
                onNodeHover={setHoveredNode}
              />
            </div>

            <PoemDetails selectedNode={selectedNode} graphData={graphData} />
          </div>

          <ControlBar
            onComplete={onComplete}
            playgroundUnlocked={playgroundUnlocked}
            enterPlayground={enterPlayground}
          />
        </div>
      </div>
    </div>
  );
};

export default EchoMode;
