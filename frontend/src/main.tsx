import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "@/hooks/useChat";
import { suppressThreeJSWarnings } from "@/utils/logger";
import "./index.css";

// Suppress Three.js warnings globally
suppressThreeJSWarnings();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
