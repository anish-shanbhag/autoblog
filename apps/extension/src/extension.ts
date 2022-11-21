import {
  buildRecipes,
  getBuildEntryPointFromPackage,
  getRecipesEntryPointFromPath,
  getRecipesFromImport,
  runRecipeFromPackage,
} from "@cryo/cli";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("cryogen.runLocalRecipe", async () => {
      const packageRoot =
        vscode.workspace.workspaceFolders![0].uri.path.replace(/^\/+/g, "");
      const { hasTypeScriptEntryPoint } = await getRecipesEntryPointFromPath(
        packageRoot
      );
      process.chdir(packageRoot);

      if (hasTypeScriptEntryPoint) {
        await buildRecipes({ path: packageRoot, skipTypecheck: true });
      }

      const recipes = await getRecipesFromImport(
        "file://" + (await getBuildEntryPointFromPackage(packageRoot))
      );

      const recipeName = await vscode.window.showQuickPick(
        Object.keys(recipes),
        {
          title: "Cryogen: Run a local Recipe",
          placeHolder: "Select a Recipe to run...",
        }
      );

      if (recipeName) {
        await runRecipeFromPackage(packageRoot, recipeName);
      }
    })
  );
}
