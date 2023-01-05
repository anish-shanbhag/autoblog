import fs from "fs/promises";
import path from "path";

// This specific path is used  to avoid Chakra UI errors which happen when
// @cryo/extension imports the entire package (i.e. from src/index.ts)
import { DiffItem, DiffStatus } from "@cryo/ui/src/DiffView/types";
import * as vscode from "vscode";

export async function handleMessage(
  webviewView: vscode.WebviewView,
  message:
    | { type: "reload" }
    | { type: "populate"; path: string }
    | { type: "open"; path: string }
) {
  switch (message.type) {
    case "reload":
      vscode.commands.executeCommand("workbench.action.reloadWindow");
      break;
    case "populate":
      webviewView.webview.postMessage({
        type: "populate",
        path: message.path,
        files: (
          await fs.readdir(path.join(process.cwd(), message.path), {
            withFileTypes: true,
          })
        ).map<DiffItem>((dirent) => {
          if (dirent.isDirectory()) {
            return {
              type: "tree",
              path: path.join(message.path, dirent.name),
              children: [],
              populated: false,
              expanded: false,
              status: DiffStatus.None,
            };
          }
          return {
            type: "file",
            path: path.join(message.path, dirent.name),
            status: DiffStatus.None,
          };
        }),
      });
      break;
    case "open":
      await vscode.commands.executeCommand(
        "vscode.diff",
        vscode.Uri.parse("cryogen:" + message.path),
        vscode.Uri.file(path.join(process.cwd(), message.path)),
        `(*) ${path.basename(message.path)}`
      );
      break;
  }
}
