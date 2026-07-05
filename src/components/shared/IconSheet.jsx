import React from "react";
import icons from "./icons";

/**
 * Dev-only proof sheet for the icon set (route: /dev/icons).
 * Every mark at three sizes, in both inks.
 */
const IconSheet = () => (
  <div className="relative z-10 min-h-screen bg-paper bg-laid p-10">
    <p className="text-label text-seal/70 mb-6">proof sheet — marks cut for poit</p>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Object.entries(icons).map(([name, Icon]) => (
        <div
          key={name}
          className="bg-surface border border-ink/10 rounded-lg p-4 flex flex-col items-center gap-3"
        >
          <div className="flex items-end gap-3 text-ink">
            <Icon className="w-4 h-4" />
            <Icon className="w-6 h-6" />
            <Icon className="w-9 h-9" />
          </div>
          <Icon className="w-6 h-6 text-seal" />
          <span className="font-mono text-[10px] text-ink/50">{name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default IconSheet;
