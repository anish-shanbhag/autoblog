import fs from "fs/promises";
import path from "path";

import { getMetadataPath, getRunning } from "@cryo/node-utils";
import { emptyFileTreeMap, FileTreeMap } from "@cryo/utils";
import vscode from "vscode";

import { workspaceRoot } from "../extension";

import { gitDiff } from "./diff";
import { handleMessage } from "./message";
import { getPopulatedFileItems } from "./populate";
import { updateFileItem } from "./update";

export const fileTreeMap: FileTreeMap = emptyFileTreeMap;
export let explorerWebview: vscode.Webview | null = null;
export let recipeRunning = false;

export async function createExplorerWebview(context: vscode.ExtensionContext) {
  // populate the workspace root
  for (const fileItem of await getPopulatedFileItems("")) {
    updateFileItem(fileItem);
  }

  await setRunningState();

  if (recipeRunning) {
    gitDiff();
  }

  const indexHtml = await fs.readFile(
    path.join(
      context.extensionPath,
      // swap out index.html for development
      context.extensionMode === vscode.ExtensionMode.Development
        ? "src/explorer/index.dev.html"
        : "dist/webview/index.html"
    ),
    "utf-8"
  );

  return vscode.window.registerWebviewViewProvider("cryogen-diff-explorer", {
    resolveWebviewView(webviewView) {
      webviewView.webview.html = indexHtml;
      webviewView.webview.options = {
        enableScripts: true,
      };
      webviewView.webview.onDidReceiveMessage(handleMessage);
      explorerWebview = webviewView.webview;
      webviewView.onDidDispose(() => {
        explorerWebview = null;
      });
    },
  });
}

async function setRunningState() {
  const running = await getRunning();
  // TODO: temporarily swapped for testing
  recipeRunning = !running[workspaceRoot];
}

/** Creates a watcher keeping track of whether a recipe is currently running. */
export function createRunningWatcher() {
  const watcher = vscode.workspace.createFileSystemWatcher(
    getMetadataPath("_running")
  );
  watcher.onDidChange(setRunningState);
  return watcher;
}
