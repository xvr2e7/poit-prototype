import React from "react";
import PulseMode from "../core/pulse/PulseMode";
import CraftMode from "../core/craft/CraftMode";
import { usePlaygroundState } from "../../utils/hooks/usePlaygroundState";

// Co-located component for mode selection
const ModeSelector = ({
  currentMode,
  setCurrentMode,
  pulseCompleted,
  craftCompleted,
}) => (
  <header className="bg-white shadow-md p-4">
    <div className="max-w-4xl mx-auto flex justify-center space-x-4">
      <button
        onClick={() => setCurrentMode("pulse")}
        disabled={pulseCompleted}
        className={`px-6 py-2 rounded-lg transition-colors ${
          pulseCompleted
            ? "bg-gray-200 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Pulse Mode
      </button>
      <button
        onClick={() => setCurrentMode("craft")}
        disabled={!pulseCompleted || craftCompleted}
        className={`px-6 py-2 rounded-lg transition-colors ${
          !pulseCompleted || craftCompleted
            ? "bg-gray-200 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Craft Mode
      </button>
    </div>
  </header>
);

// Main playground component with co-located subcomponents
function PlayMode() {
  const {
    currentMode,
    pulseCompleted,
    craftCompleted,
    selectedWords,
    completePulse,
    completeCraft,
    restartPulseMode,
    setCurrentMode,
  } = usePlaygroundState();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <ModeSelector
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        pulseCompleted={pulseCompleted}
        craftCompleted={craftCompleted}
      />

      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          {currentMode === "pulse" ? (
            <PulseMode onComplete={completePulse} />
          ) : (
            <CraftMode
              onComplete={completeCraft}
              selectedWords={selectedWords}
              isCompleted={craftCompleted}
            />
          )}

          {craftCompleted && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={restartPulseMode}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Restart Pulse Mode
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PlayMode;
