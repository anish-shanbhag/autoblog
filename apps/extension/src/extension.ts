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
  context.subscriptions.push(
    vscode.commands.registerCommand("cryogen.runLocalRecipe", async () => {
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
