import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { ThemeProvider } from "./components/shared/AdaptiveBackground";
import { Analytics } from "@vercel/analytics/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <Analytics />
    </ThemeProvider>
  </React.StrictMode>
);
