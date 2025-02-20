import { useState, useCallback, useRef } from "react";

export const useTemplate = () => {
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [guideIntensity, setGuideIntensity] = useState(1);
  const [hoveredPosition, setHoveredPosition] = useState(null);
  const templateStateRef = useRef({
    snapPoints: new Map(),
    rhymeConnections: new Map(),
    templateBounds: null,
  });

  const activateTemplate = useCallback((templateName) => {
    setActiveTemplate(templateName);
    setGuideIntensity(1);
    // Reset template state
    templateStateRef.current = {
      snapPoints: new Map(),
      rhymeConnections: new Map(),
      templateBounds: null,
    };
  }, []);

  const deactivateTemplate = useCallback(() => {
    setActiveTemplate(null);
    setGuideIntensity(0);
    setHoveredPosition(null);
  }, []);

  const handlePositionHover = useCallback((position) => {
    setHoveredPosition(position);
    const connections = templateStateRef.current.rhymeConnections.get(position);
    if (connections) {
      connections.forEach((connectedPos) => {});
    }
  }, []);

  const checkWordPosition = useCallback(
    (wordPos) => {
      if (!activeTemplate) return null;

      // Check if word is near any snap points
      const snapPoints = templateStateRef.current.snapPoints;
      for (const [point, config] of snapPoints) {
        const distance = Math.hypot(wordPos.x - point.x, wordPos.y - point.y);
        if (distance < config.snapRadius) {
          return {
            snapPoint: point,
            snapConfig: config,
          };
        }
      }
      return null;
    },
    [activeTemplate]
  );

  const adjustWordPosition = useCallback(
    (word, position) => {
      const snapInfo = checkWordPosition(position);
      if (!snapInfo) return position;

      // Apply snapping with smooth transition
      return {
        x: snapInfo.snapPoint.x,
        y: snapInfo.snapPoint.y,
        snapConfig: snapInfo.snapConfig,
      };
    },
    [checkWordPosition]
  );

  return {
    activeTemplate,
    guideIntensity,
    hoveredPosition,
    activateTemplate,
    deactivateTemplate,
    handlePositionHover,
    adjustWordPosition,
  };
};
