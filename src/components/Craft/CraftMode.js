import React from 'react';

function CraftMode({ onComplete }) {
  const handleAction = () => {
    // Simulate completing a task
    alert('Craft task completed!');
    onComplete();
  };

  return (
    <div className="craft-mode">
      <h2>Pulse Mode</h2>
      <p>Complete the craft task to unlock Echo Mode.</p>
      <button onClick={handleAction}>Complete Craft Task</button>
    </div>
  );
}

export default CraftMode;
