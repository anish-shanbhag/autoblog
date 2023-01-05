import fs from "fs/promises";
import path from "path";

import {
  buildRecipes,
  getBuildEntryPointFromPackage,
  getRecipesEntryPointFromPath,
  getRecipesFromImport,
  runRecipeFromPackage,
} from "@cryo/cli";
import * as vscode from "vscode";

import { handleMessage } from "./handleMessage.js";
import { PreviousStepProvider } from "./providers.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = vscode.window.createOutputChannel("Cryogen");

export function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.path.replace(
    /^\/+/g,
    ""
  );
  process.chdir(workspaceRoot);

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      "cryogen",
      new PreviousStepProvider()
    ),
    vscode.window.registerWebviewViewProvider("cryogen-diff-explorer", {
      async resolveWebviewView(webviewView) {
        const indexHtml = await fs.readFile(
          path.join(
            context.extensionPath,
            // swap out index.html for development
            context.extensionMode === vscode.ExtensionMode.Development
              ? "src/index.dev.html"
              : "dist/webview/index.html"
          ),
          "utf-8"
        );
        webviewView.webview.html = indexHtml;
        webviewView.webview.options = {
          enableScripts: true,
        };
        webviewView.webview.onDidReceiveMessage((message) =>
          handleMessage(webviewView, message)
        );
      },
    }),
    vscode.commands.registerCommand("cryogen.runLocalRecipe", async () => {
      const { hasTypeScriptEntryPoint } = await getRecipesEntryPointFromPath(
        workspaceRoot
      );

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
