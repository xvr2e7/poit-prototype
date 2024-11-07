import React from 'react';

function EchoMode({ onComplete, playgroundUnlocked, enterPlayground }) {
  const handleAction = () => {
    // Simulate completing a task
    alert('All completed!');
    onComplete();
  };

  return (
    <div className="echo-mode">
      <h2>Echo Mode</h2>
      <p>You reach the end.</p>
      <button onClick={handleAction}>Completed</button>

      {playgroundUnlocked && (
        <button
          className="playground-button"
          onClick={enterPlayground}
        >
          Enter Playground
        </button>
      )}
    </div>
  );
}

export default EchoMode;

