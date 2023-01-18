import { git } from "@cryo/node-utils";
import { FileStatus } from "@cryo/utils";
import vscode from "vscode";

import { fileTreeMap } from "./explorer/state";

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
      // edge case: if a folder with the same name was deleted and a file replaced it,
      // then the old contents should be empty instead of showing the contents of the
      // git tree object
      // TODO: revalidate when the file or equivalent folder status is changed?
      if (
        fileTreeMap[uri.path + "/"]?.type === "tree" &&
        fileTreeMap[uri.path + "/"].status === FileStatus.Deleted
      ) {
        return "";
      }
      const result = await git("show", "--textconv", "HEAD~1:" + uri.path);
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

export class EmptyFileProvider implements vscode.TextDocumentContentProvider {
  provideTextDocumentContent() {
    return "";
  }
}

export function createEmptyFileProvider() {
  return vscode.workspace.registerTextDocumentContentProvider(
    "empty",
    new EmptyFileProvider()
  );
}
