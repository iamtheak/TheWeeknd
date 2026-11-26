import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router";

// The hero restores its own (pinned, horizontal) scroll position.
if ("scrollRestoration" in window.history)
  window.history.scrollRestoration = "manual";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
