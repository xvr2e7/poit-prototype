import React from 'react';

function PulseMode({ onComplete }) {
  const handleAction = () => {
    // Simulate completing a task
    alert('Pulse task completed!');
    onComplete();
  };

  return (
    <div className="pulse-mode">
      <h2>Pulse Mode</h2>
      <p>Swipe to begin curating your lexicon</p>
      <button onClick={handleAction}>Complete Pulse Task</button>
    </div>
  );
}

export default PulseMode;
