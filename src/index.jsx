import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import App from "./App";
import { ThemeProvider } from "./components/shared/AdaptiveBackground";
import { Analytics } from "@vercel/analytics/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Analytics />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
