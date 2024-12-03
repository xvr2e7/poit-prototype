import React from "react";
import SearchControls from "./components/SearchControls";
import PoemDetails from "./components/PoemDetails";
import GraphVisualization from "./components/GraphVisualization";
import ControlBar from "./components/ControlBar";
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
    handleFilter
  } = useEchoState();

  const {
    graphRef,
    config,
    handleNodeClick: handleGraphNodeClick,
  } = useGraphLayout();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="w-full h-full flex flex-col p-4">
        <SearchControls
          filterBy={filterBy}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onFilterChange={handleFilter}
        />

        <div className="flex flex-1 gap-4">
          <GraphVisualization
            graphRef={graphRef}
            graphData={graphData}
            config={config}
            onNodeClick={(node) => {
              handleNodeClick(node);
              handleGraphNodeClick(node);
            }}
            onNodeHover={setHoveredNode}
          />

          <PoemDetails selectedNode={selectedNode} graphData={graphData} />
        </div>

        <ControlBar
          onComplete={onComplete}
          playgroundUnlocked={playgroundUnlocked}
          enterPlayground={enterPlayground}
        />
      </div>
    </div>
  );
};

export default EchoMode;
