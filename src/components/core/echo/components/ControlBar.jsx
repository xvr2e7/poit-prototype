import React from "react";

const ControlBar = ({ onComplete, playgroundUnlocked, enterPlayground }) => {
  return (
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
  );
};

export default ControlBar;
