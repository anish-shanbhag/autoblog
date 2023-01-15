import path from "path";

import { git } from "@cryo/node-utils";
import vscode from "vscode";

/**
 * Provides a previous version of a file to the diff view.
 */
export class PreviousStepProvider
  implements vscode.TextDocumentContentProvider
{
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this._onDidChange.event;

  async provideTextDocumentContent(uri: vscode.Uri) {
    try {
      const result = await git(
        "show",
        "--textconv",
        "HEAD~1:" + path.posix.relative(process.cwd(), uri.path)
      );
      return result;
    } catch (e) {
      return "";
    }
  }
}

export function createPreviousStepProvider() {
  return vscode.workspace.registerTextDocumentContentProvider(
    "cryogen",
    new PreviousStepProvider()
  );
}
