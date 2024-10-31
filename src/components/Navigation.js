import React from 'react';

function Navigation({ currentMode, setCurrentMode }) {
  return (
    <nav className="navigation">
      <button 
        className={currentMode === 'pulse' ? 'active' : ''}
        onClick={() => setCurrentMode('pulse')}
      >
        Pulse
      </button>
      <button 
        className={currentMode === 'craft' ? 'active' : ''}
        onClick={() => setCurrentMode('craft')}
      >
        Craft
      </button>
      <button 
        className={currentMode === 'echo' ? 'active' : ''}
        onClick={() => setCurrentMode('echo')}
      >
        Echo
      </button>
    </nav>
  );
}

export default Navigation;