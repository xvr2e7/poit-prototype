import React, { useState } from 'react';
import Navigation from './components/Navigation';
import PulseMode from './components/Pulse/PulseMode';
import CraftMode from './components/Craft/CraftMode';
import EchoMode from './components/Echo/EchoMode';
import './styles/App.css';

function App() {
  const [currentMode, setCurrentMode] = useState('pulse');

  const renderMode = () => {
    switch(currentMode) {
      case 'pulse':
        return <PulseMode />;
      case 'craft':
        return <CraftMode />;
      case 'echo':
        return <EchoMode />;
      default:
        return <PulseMode />;
    }
  };

  return (
    <div className="app">
      <Navigation currentMode={currentMode} setCurrentMode={setCurrentMode} />
      <main className="main-content">
        {renderMode()}
      </main>
    </div>
  );
}

export default App;