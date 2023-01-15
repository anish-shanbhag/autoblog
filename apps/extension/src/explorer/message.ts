import path from "path";

import type { FileTree } from "@cryo/utils";
import * as vscode from "vscode";

import { workspaceRoot } from "../extension";

import { getPopulatedFileItems } from "./populate";
import { explorerWebview, fileTreeMap } from "./state";
import { updateFileTreeMap } from "./update";

export async function handleMessage(
  message:
    | { type: "init" }
    | { type: "reload" }
    | { type: "expand"; path: string; expanded: boolean }
    | { type: "open"; path: string }
) {
  switch (message.type) {
    case "reload":
      vscode.commands.executeCommand("workbench.action.reloadWindow");
      break;
    case "init":
      // send the initial fileTreeMap to the webview once it has loaded
      explorerWebview?.postMessage({
        type: "diff",
        fileItems: Object.values(fileTreeMap),
      });
      break;
    case "expand": {
      // no need for updateFileTreeMap here because the tree has already
      // been expanded in React state
      fileTreeMap[message.path] = {
        ...(fileTreeMap[message.path] as FileTree),
        expanded: message.expanded,
      };
      // populate the tree if it hasn't already been populated
      if (!(fileTreeMap[message.path] as FileTree).populated) {
        await updateFileTreeMap(await getPopulatedFileItems(message.path));
      }
      break;
    }
    case "open":
      await vscode.commands.executeCommand(
        "vscode.diff",
        vscode.Uri.parse("cryogen:" + message.path),
        vscode.Uri.file(path.join(workspaceRoot, message.path)),
        `(*) ${path.basename(message.path)}`
      );
      break;
  }
}
