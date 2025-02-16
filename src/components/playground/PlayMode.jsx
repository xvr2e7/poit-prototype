import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";
import PulseMode from "../core/pulse/PulseMode";
import CraftMode from "../core/craft/CraftMode";
import { usePlaygroundState } from "../../utils/hooks/usePlaygroundState";
import Navigation from "../shared/Navigation";

const PremiumFeatureModal = ({ isOpen, onClose, feature, onLoginRequest }) => {
  if (!isOpen) return null;

  const featureMessages = {
    template: "Templates help you structure your poetry with classic forms.",
    signature: "Signatures let you create and save your personal lexicon.",
    download: "Download your poems to share them outside POiT.",
    share: "Share your creations directly to social media.",
    continue: "Continue your poetic journey with full features.",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-950 rounded-xl 
          border border-[#2C8C7C]/20 p-6 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-[#2C8C7C]" />
          <h3 className="text-xl font-medium text-[#2C8C7C]">
            Premium Feature
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {featureMessages[feature]} Create an account to unlock this and other
          premium features.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-[#2C8C7C]/5 
              text-[#2C8C7C] transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              onLoginRequest(feature);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-[#2C8C7C] hover:bg-[#2C8C7C]/90 
              text-white transition-colors"
          >
            Create Account
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

function PlayMode({ onExit, onLoginRequest }) {
  const {
    currentMode,
    pulseCompleted,
    craftCompleted,
    selectedWords,
    lockedModes,
    completePulse,
    completeCraft,
    restartPulseMode,
    setCurrentMode,
  } = usePlaygroundState();

  const [premiumFeature, setPremiumFeature] = useState(null);

  const handlePremiumFeature = (feature) => {
    onLoginRequest(feature);
  };

  const handleCraftComplete = () => {
    handlePremiumFeature("continue");
  };

  return (
    <div className="min-h-screen">
      <Navigation
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        lockedModes={lockedModes}
        inPlayground={true}
        onExit={onExit}
      />

      <main>
        {currentMode === "pulse" ? (
          <PulseMode onComplete={completePulse} />
        ) : (
          <CraftMode
            onComplete={handleCraftComplete}
            selectedWords={selectedWords}
            enabled={!lockedModes.craft}
            isPlayground={true}
            onPremiumFeature={handlePremiumFeature}
          />
        )}
      </main>

      <AnimatePresence>
        {premiumFeature && (
          <PremiumFeatureModal
            isOpen={true}
            onClose={() => setPremiumFeature(null)}
            feature={premiumFeature}
            onLoginRequest={onLoginRequest}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default PlayMode;
