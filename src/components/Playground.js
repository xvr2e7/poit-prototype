import React, { useState } from 'react';
import PulseMode from './Pulse/PulseMode';
import CraftMode from './Craft/CraftMode';
import '../styles/Playground.css';

function Playground() {
  const [currentMode, setCurrentMode] = useState('pulse');
  const [pulseCompleted, setPulseCompleted] = useState(false);
  const [craftCompleted, setCraftCompleted] = useState(false);

  const completePulse = () => {
    setPulseCompleted(true);
    setCurrentMode('craft');
  };

  const completeCraft = () => {
    setCraftCompleted(true);
  };

  const restartPulseMode = () => {
    setPulseCompleted(false);
    setCraftCompleted(false);
    setCurrentMode('pulse');
  };

  const renderMode = () => {
    switch (currentMode) {
      case 'pulse':
        return <PulseMode onComplete={completePulse} />;
      case 'craft':
        return (
          <CraftMode
            onComplete={completeCraft}
            restartPulse={restartPulseMode}
            isCompleted={craftCompleted}
          />
        );
      default:
        return <PulseMode onComplete={completePulse} />;
    }
  };

  return (
    <div className="playground">
      <header className="playground-header">
        <button onClick={() => setCurrentMode('pulse')} disabled={pulseCompleted}>
          Pulse Mode
        </button>
        <button onClick={() => setCurrentMode('craft')} disabled={!pulseCompleted || craftCompleted}>
          Craft Mode
        </button>
      </header>
      <main className="playground-content">
        {renderMode()}
        {craftCompleted && (
          <button className="restart-button" onClick={restartPulseMode}>
            Restart Pulse Mode
          </button>
        )}
      </main>
    </div>
  );
}

export default Playground;