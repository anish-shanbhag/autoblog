import path from "path";

import { runProcess } from "@cryo/cli";
import * as vscode from "vscode";

export class PreviousStepProvider
  implements vscode.TextDocumentContentProvider
{
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this._onDidChange.event;

  async provideTextDocumentContent(uri: vscode.Uri) {
    const gitArgs = ["--git-dir", ".cryogen", "--work-tree", "."];
    console.log("here");

    try {
      const result = await runProcess("git", [
        ...gitArgs,
        "show",
        "--textconv",
        "HEAD~1:" +
          path.relative(process.cwd(), uri.path).replaceAll("\\", "/"),
      ]);
      console.log(result);
      return result;
    } catch (e) {
      return "";
    }
  }
}
