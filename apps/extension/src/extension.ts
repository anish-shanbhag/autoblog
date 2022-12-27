import fs from "fs";
import path from "path";

import {
  buildRecipes,
  getBuildEntryPointFromPackage,
  getRecipesEntryPointFromPath,
  getRecipesFromImport,
  runRecipeFromPackage,
} from "@cryo/cli";
import * as vscode from "vscode";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = vscode.window.createOutputChannel("Cryogen");

export function activate(context: vscode.ExtensionContext) {
  // const rootPath =
  //   vscode.workspace.workspaceFolders &&
  //   vscode.workspace.workspaceFolders.length > 0
  //     ? vscode.workspace.workspaceFolders[0].uri.fsPath
  //     : undefined;

  // const nodeDependenciesProvider = new DiffTreeProvider(
  //   rootPath as string,
  //   [
  //     "apps/extension/src/extension.ts",
  //     "packages/recipes/src/utils.ts",
  //     "apps/extension/src/treeDataProvider.ts",
  //     "test.txt",
  //     "app.js",
  //     "cli/package.json",
  //     "cli/src/index.ts",
  //     "cli/src/commands/build.ts",
  //     "cli/src/commands/run.ts",
  //   ].map((filePath) => path.normalize(filePath))
  // );

  // vscode.window.createTreeView("cryogen-diff-explorer", {
  //   treeDataProvider: nodeDependenciesProvider,
  // });

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("cryogen-diff-explorer", {
      resolveWebviewView(webviewView) {
        webviewView.webview.options = {
          enableScripts: true,
        };
        const indexHtml = fs
          .readFileSync(
            path.join(
              context.extensionPath,
              "src",
              "webview",
              // swap out the index.html for development
              context.extensionMode === vscode.ExtensionMode.Development
                ? "index.dev.html"
                : "index.html"
            ),
            "utf-8"
          )
          // replace the script src with the proper VS Code Uri for production
          .replace(
            `"main.tsx"`,
            `"${webviewView.webview
              .asWebviewUri(
                vscode.Uri.joinPath(
                  context.extensionUri,
                  "src/webview/build/index.js"
                )
              )
              .toString()}"`
          );
        webviewView.webview.html = indexHtml;
        webviewView.webview.onDidReceiveMessage((message: { type: string }) => {
          if (message.type === "reload") {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          }
        });
      },
    }),
    vscode.commands.registerCommand("cryogen.runLocalRecipe", async () => {
      // nodeDependenciesProvider.refresh();
      const workspaceRoot =
        vscode.workspace.workspaceFolders![0].uri.path.replace(/^\/+/g, "");
      const { hasTypeScriptEntryPoint } = await getRecipesEntryPointFromPath(
        workspaceRoot
      );

      process.chdir(workspaceRoot);

      if (hasTypeScriptEntryPoint) {
        await buildRecipes({ path: workspaceRoot, skipTypecheck: true });
      }

      const recipes = await getRecipesFromImport(
        "file://" + (await getBuildEntryPointFromPackage(workspaceRoot))
      );

      const recipeTitle = await vscode.window.showQuickPick(
        Object.values(recipes).map((recipe) => recipe.title),
        {
          title: "Cryogen: Run a local Recipe",
          placeHolder: "Select a Recipe to run...",
        }
      );

      if (recipeTitle) {
        await runRecipeFromPackage(
          workspaceRoot,
          Object.keys(recipes).find(
            (recipeName) => recipes[recipeName].title === recipeTitle
          )!
        );
        await vscode.commands.executeCommand(
          "vscode.diff",
          vscode.Uri.file(path.join(process.cwd(), ".cryogen/tmp")),
          vscode.Uri.file(path.join(process.cwd(), "test.txt")),
          "(*) test.txt"
        );
      }
    })
  );
}
