import React from "react";
import packageJson from "../../../package.json";

const VersionBadge = ({ version = packageJson.version }) => {
  return (
    <div
      className="fixed bottom-2 left-2 z-10 px-1.5 py-0.5
        text-[10px] text-seal/30 select-none pointer-events-none"
    >
      v{version}
    </div>
  );
};

export default VersionBadge;
