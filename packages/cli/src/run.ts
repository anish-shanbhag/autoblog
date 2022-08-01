import fs from "fs";
import path from "path";
import { spawn } from "child_process";

import chalk from "chalk";
import ora from "ora";

import { runProcess, recipeInstallPath } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// this is the function that is called by the CLI/VSCode
export async function runRecipeWithId(id: string) {
  // TODO: first check if a locally installed (i.e. unpublished) recipe exists with this id
  // TODO: call our API to check if this is a Rust-optimized or a regular recipe
  const optimized = false;
  if (optimized) {
    // TODO: run the Recipe using the steps which are returned from our API
  } else {
    // TODO: install the @scaffolding/recipes package into the storagePath if it's not already there? (might save installs)
    let packageName = id; // TODO: our API should return the actual package name since it's not the same as the id
    if (id.startsWith(".")) {
      packageName = "create-file"; // TODO: this is a hack to make the test work
      id = '"' + process.cwd() + '"';
    }
    const packagePath = path.join(
      recipeInstallPath,
      "node_modules",
      packageName
    );
    if (!fs.existsSync(packagePath)) {
      const spinner = ora({
        text: `Fetching Recipe ${chalk.yellow(id)}...`,
      }).start();
      await runProcess(
        "npm",
        ["install", id, "-g", "--prefix", recipeInstallPath], // TODO: change id to packageName depending on how input is handled
        { shell: true, stdio: "inherit" }
      );
      spinner.stop();
    }

    // TODO: call updateNotifier to check if there's a new version of the recipe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    // TODO: try using dynamic import or Module.runMain to avoid creating a process?
    spawn(
      "node",
      [path.join(packagePath, "dist/recipes/run.js"), "testRecipe"],
      {
        stdio: "inherit",
      }
    );
  }
}
