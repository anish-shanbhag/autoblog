import {
  buildRecipes,
  getBuildEntryPointFromPackage,
  getRecipesEntryPointFromPath,
  getRecipesFromImport,
  runRecipeFromPackage,
} from "@cryo/cli";
import vscode from "vscode";

import { workspaceRoot } from "./extension";

export function createRunLocalRecipeCommand() {
  return vscode.commands.registerCommand("cryogen.runLocalRecipe", async () => {
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
    }
  });
}
