import { ExplorerView } from "@cryo/ui";
import React from "react";
import { createRoot } from "react-dom/client";

const vscode = acquireVsCodeApi();

// When Vite tries to do a full reload it normally breaks the webview
// so, instead we send a message to VS Code to reload the VS Code window
// itself instead of the webview.
if (import.meta.hot) {
  window.onbeforeunload = () => {
    vscode.postMessage({
      type: "reload",
    });
    return false;
  };
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ExplorerView />
  </React.StrictMode>
);
