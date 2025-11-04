import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import medsupplyPng from "./assets/medsupply.png";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Set favicon programmatically (works in dev and build)
(() => {
  try {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = medsupplyPng;
    document.head.appendChild(link);
  } catch (e) {
    // no-op
  }
})();
