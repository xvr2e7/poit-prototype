import React from "react";

function Navigation({
  currentMode,
  setCurrentMode,
  lockedModes,
  inPlayground,
}) {
  const handleModeChange = (mode) => {
    if (!lockedModes[mode]) {
      setCurrentMode(mode);
    }
  };

  const getItemClasses = (mode) => {
    const baseClasses =
      "px-6 py-2 cursor-pointer transition-colors duration-200 relative";
    const activeClasses =
      "text-blue-600 font-medium after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600";
    const disabledClasses = "text-gray-400 cursor-not-allowed";

    if (currentMode === mode) {
      return `${baseClasses} ${activeClasses}`;
    }
    if (lockedModes[mode]) {
      return `${baseClasses} ${disabledClasses}`;
    }
    return `${baseClasses} hover:text-blue-600`;
  };

  return (
    <nav className="bg-white shadow-sm">
      <ul className="flex justify-center items-center h-16 space-x-8">
        <li
          className={getItemClasses("pulse")}
          onClick={() => handleModeChange("pulse")}
          role="button"
          tabIndex={0}
        >
          Pulse Mode
        </li>
        <li
          className={getItemClasses("craft")}
          onClick={() => handleModeChange("craft")}
          role="button"
          tabIndex={0}
        >
          Craft Mode
        </li>
        {!inPlayground && (
          <li
            className={getItemClasses("echo")}
            onClick={() => handleModeChange("echo")}
            role="button"
            tabIndex={0}
          >
            Echo Mode
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
