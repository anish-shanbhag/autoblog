import path from "path";

import * as vscode from "vscode";

import { createRunLocalRecipeCommand } from "./commands";
import { createExplorerWebview, createRunningWatcher } from "./explorer/state";
import { createExplorerWatcher } from "./explorer/watch";
import { createPreviousStepProvider } from "./providers";

export let workspaceRoot: string;

export async function activate(context: vscode.ExtensionContext) {
  workspaceRoot = path.posix.normalize(
    vscode.workspace.workspaceFolders![0].uri.path.replace(/^\/+/g, "")
  );
  process.chdir(workspaceRoot);

  // order of these is important since some depend on others
  // TODO: make this more explicit or remove the dependencies?
  context.subscriptions.push(
    createRunningWatcher(),
    await createExplorerWatcher(),
    await createExplorerWebview(context),
    createPreviousStepProvider(),
    createRunLocalRecipeCommand()
  );
}
