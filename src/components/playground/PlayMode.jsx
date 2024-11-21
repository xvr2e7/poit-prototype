import React, { useState } from "react";
import PulseMode from "../core/pulse/PulseMode";
import CraftMode from "../core/craft/CraftMode";

function Playground() {
  const [currentMode, setCurrentMode] = useState("pulse");
  const [pulseCompleted, setPulseCompleted] = useState(false);
  const [craftCompleted, setCraftCompleted] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);

  const completePulse = (words) => {
    setSelectedWords(words);
    setPulseCompleted(true);
    setCurrentMode("craft");
  };

  const completeCraft = () => {
    setCraftCompleted(true);
  };

  const restartPulseMode = () => {
    setPulseCompleted(false);
    setCraftCompleted(false);
    setSelectedWords([]);
    setCurrentMode("pulse");
  };

  const renderMode = () => {
    switch (currentMode) {
      case "pulse":
        return <PulseMode onComplete={completePulse} />;
      case "craft":
        return (
          <CraftMode
            onComplete={completeCraft}
            selectedWords={selectedWords}
            isCompleted={craftCompleted}
          />
        );
      default:
        return <PulseMode onComplete={completePulse} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
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

      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          {renderMode()}
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

export default Playground;
