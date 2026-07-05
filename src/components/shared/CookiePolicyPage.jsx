import React from "react";
import { motion } from "framer-motion";
import { IconBack } from "./icons";
import AdaptiveBackground from "./AdaptiveBackground";

const CookiePolicyPage = ({ onBack }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <AdaptiveBackground />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/95 backdrop-blur-sm rounded-xl p-8 border border-ink/10 shadow-leaf dark:shadow-leaf-dark"
        >
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 mr-4 rounded-lg hover:bg-seal/10 text-seal"
            >
              <IconBack className="w-5 h-5" />
            </motion.button>
            <h1 className="font-serif text-2xl font-medium text-ink">
              Cookie policy
            </h1>
          </div>

          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-ink/70">
              This Cookie Policy explains how POiT uses cookies and similar
              technologies to enhance your experience when using the web
              application.
            </p>

            <h2 className="font-serif text-lg font-medium text-ink mt-6">
              What are cookies?
            </h2>
            <p className="text-ink/70">
              Cookies are small text files that are stored on your browser or
              device when you visit a website. They allow the website to
              remember your actions and preferences over a period of time.
            </p>

            <h2 className="font-serif text-lg font-medium text-ink mt-6">
              How POiT uses cookies
            </h2>
            <p className="text-ink/70">
              POiT uses cookies primarily to:
            </p>
            <ul className="list-disc pl-5 text-ink/70 space-y-1">
              <li>Remember your preferences and theme settings</li>
              <li>Save your creative progress (poems, word selections)</li>
              <li>Track your daily streaks and constellation patterns</li>
              <li>
                Maintain your session state when navigating between different
                modes
              </li>
              <li>Improve the overall user experience and performance</li>
            </ul>

            <h2 className="font-serif text-lg font-medium text-ink mt-6">
              Types of cookies we use
            </h2>

            <h3 className="font-serif text-base font-medium text-ink mt-4">
              Essential cookies
            </h3>
            <p className="text-ink/70">
              These cookies are necessary for the application to function and
              cannot be switched off. They include:
            </p>
            <ul className="list-disc pl-5 text-ink/70 space-y-1">
              <li>
                <code>poit_cookie_consent</code>: Records your cookie consent
              </li>
              <li>
                <code>poit_theme</code>: Stores your theme preference
                (light/dark)
              </li>
            </ul>

            <h3 className="font-serif text-base font-medium text-ink mt-4">
              Functionality cookies
            </h3>
            <p className="text-ink/70">
              These cookies enable personalized features and save your poetic
              journey:
            </p>
            <ul className="list-disc pl-5 text-ink/70 space-y-1">
              <li>
                <code>poit_daily_words</code>: Your selected words from Pulse
                mode
              </li>
              <li>
                <code>poit_current_poem</code>: Your current poem in progress
              </li>
              <li>
                <code>poit_poems_history</code>: Your previously created poems
              </li>
              <li>
                <code>poit_navigation_history</code>: Your navigation path
                through poems
              </li>
              <li>
                <code>poit_streak</code>: Your daily streak information
              </li>
            </ul>

            <h2 className="font-serif text-lg font-medium text-ink mt-6">
              Managing cookies
            </h2>
            <p className="text-ink/70">
              Most web browsers allow you to manage your cookie preferences. You
              can:
            </p>
            <ul className="list-disc pl-5 text-ink/70 space-y-1">
              <li>Delete cookies from your device</li>
              <li>
                Block cookies by activating the setting on your browser that
                allows you to refuse all or some cookies
              </li>
              <li>Set your browser to notify you when you receive a cookie</li>
            </ul>
            <p className="text-ink/70 mt-2">
              Please note that if you choose to block or delete cookies, some
              features of POiT may not function correctly, and you may lose
              saved progress.
            </p>

            <div className="mt-8 font-mono text-xs text-ink/40">
              Last updated: July 2026
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
