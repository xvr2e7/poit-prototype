import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Login from './components/Login';
import PulseMode from './components/Pulse/PulseMode';
import CraftMode from './components/Craft/CraftMode';
import EchoMode from './components/Echo/EchoMode';
import Playground from './components/Playground'; // Import Playground page
import './styles/App.css';
import './styles/Login.css';
import './styles/Modes.css';

function App() {
  const [currentMode, setCurrentMode] = useState('pulse');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lockedModes, setLockedModes] = useState({ craft: true, echo: true });
  const [playgroundUnlocked, setPlaygroundUnlocked] = useState(false);
  const [inPlayground, setInPlayground] = useState(false); // Track if in Playground

  const unlockMode = (mode) => {
    setLockedModes((prev) => ({ ...prev, [mode]: false }));
  };

  const unlockPlayground = () => {
    setPlaygroundUnlocked(true);
  };

  const enterPlayground = () => {
    setIsAuthenticated(true); // Allow direct access to Playground
    setInPlayground(true); // Switch to Playground view
  };

  const renderMode = () => {
    if (inPlayground) {
      return <Playground />; // If in Playground, render Playground
    }

    switch (currentMode) {
      case 'pulse':
        return <PulseMode onComplete={() => unlockMode('craft')} />;
      case 'craft':
        return <CraftMode onComplete={() => unlockMode('echo')} />;
      case 'echo':
        return <EchoMode
          onComplete={unlockPlayground}
          playgroundUnlocked={playgroundUnlocked}
          enterPlayground={enterPlayground}
        />;
      default:
        return <PulseMode />;
    }
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} enterPlayground={enterPlayground} />;
  }

  return (
    <div className="app">
      <Navigation
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        lockedModes={lockedModes}
        inPlayground={inPlayground} // Pass flag to Navigation
      />
      <main className="main-content">{renderMode()}</main>
    </div>
  );
}

export default App;
