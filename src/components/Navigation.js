import React from 'react';
import '../styles/Navigation.css';

function Navigation({ currentMode, setCurrentMode, lockedModes, inPlayground }) {
  const handleModeChange = (mode) => {
    if (!lockedModes[mode]) {
      setCurrentMode(mode);
    }
  };

  return (
    <nav className="navigation">
      <ul>
        <li
          className={currentMode === 'pulse' ? 'active' : ''}
          onClick={() => handleModeChange('pulse')}
        >
          Pulse Mode
        </li>
        <li
          className={currentMode === 'craft' ? 'active' : ''}
          onClick={() => handleModeChange('craft')}
          disabled={lockedModes.craft}
        >
          Craft Mode
        </li>
        {!inPlayground && (
          <li
            className={currentMode === 'echo' ? 'active' : ''}
            onClick={() => handleModeChange('echo')}
            disabled={lockedModes.echo}
          >
            Echo Mode
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
