import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  LayoutTemplate,
  Eye,
  Save,
  Wand2,
  ArrowRightCircle,
} from "lucide-react";

const ToolButton = ({
  icon: Icon,
  label,
  onClick,
  isActive,
  variant = "default",
}) => {
  const baseClasses =
    "group relative p-3 rounded-lg backdrop-blur-sm transition-all duration-300";
  const variantClasses = {
    default: `${
      isActive
        ? "bg-white/10 border-cyan-400/30"
        : "bg-white/5 border-cyan-500/20"
    }
      border hover:bg-white/10 hover:border-cyan-500/30`,
    primary: "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/30 border",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {/* Ambient glow for active state */}
      {isActive && (
        <div className="absolute inset-0 rounded-lg bg-cyan-400/10 blur-sm" />
      )}

      <Icon
        className={`
          relative z-10 w-5 h-5 transition-colors duration-300
          ${isActive ? "text-cyan-300" : "text-cyan-400/70"}
          ${variant === "primary" ? "text-cyan-300" : ""}
          group-hover:text-cyan-300
        `}
      />

      {/* Label tooltip */}
      <div
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
        bg-gray-950/90 border border-cyan-500/20 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-300 
        pointer-events-none px-3 py-2"
      >
        <span className="text-sm text-cyan-300/90 whitespace-nowrap font-medium">
          {label}
        </span>
      </div>
    </motion.button>
  );
};

const ToolSeparator = () => <div className="w-full h-px bg-cyan-500/10 my-3" />;

const ToolGroup = ({ children, className = "" }) => (
  <div className={`flex flex-col gap-3 ${className}`}>{children}</div>
);

const ToolBar = ({
  onDepthChange,
  onTemplateToggle,
  onPreviewToggle,
  onSave,
  onEffectsToggle,
  onComplete,
  activeTools = [],
}) => {
  return (
    <div className="h-full w-20 bg-white/5 backdrop-blur-sm border-l border-cyan-500/20 flex flex-col">
      <div className="flex-1 p-4 flex flex-col">
        {/* Primary tools */}
        <ToolGroup>
          <ToolButton
            icon={LayoutTemplate}
            label="Choose Template"
            onClick={onTemplateToggle}
            isActive={activeTools.includes("template")}
          />
          <ToolButton
            icon={Layers}
            label="Adjust Depth"
            onClick={onDepthChange}
            isActive={activeTools.includes("depth")}
          />
        </ToolGroup>

        <ToolSeparator />

        {/* Effects and Preview */}
        <ToolGroup>
          <ToolButton
            icon={Wand2}
            label="Apply Effects"
            onClick={onEffectsToggle}
            isActive={activeTools.includes("effects")}
          />
          <ToolButton
            icon={Eye}
            label="Preview Poem"
            onClick={onPreviewToggle}
            isActive={activeTools.includes("preview")}
          />
        </ToolGroup>

        {/* Save and Complete */}
        <ToolGroup className="mt-auto">
          <ToolSeparator />
          <ToolButton icon={Save} label="Save Draft" onClick={onSave} />
          <ToolButton
            icon={ArrowRightCircle}
            label="Complete Poem"
            onClick={onComplete}
            variant="primary"
          />
        </ToolGroup>
      </div>
    </div>
  );
};

export default ToolBar;
