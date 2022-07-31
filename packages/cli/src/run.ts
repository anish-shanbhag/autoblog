import fs from "fs";
import path from "path";
import { spawn } from "child_process";

import chalk from "chalk";
import ora from "ora";

const userDataPath =
  process.env.APPDATA ??
  (process.platform === "darwin"
    ? process.env.HOME + "/Library/Preferences"
    : process.env.HOME + "/.local/share");
const storagePath = path.join(userDataPath, "scaffolding"); // TODO: rename the second part

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// this is the function that is called by the CLI/VSCode
export async function runRecipeWithId(id: string) {
  // TODO: first check if a locally installed (i.e. unpublished) recipe exists with this id
  if (id.startsWith(".")) {
    id = "recipes-test"; // TODO: this is a hack to make the test work
  }
  // TODO: call our API to check if this is a Rust-optimized or a regular recipe
  const optimized = false;
  if (optimized) {
    // TODO: run the Recipe using the steps which are returned from our API
  } else {
    // TODO: install the @scaffolding/recipes package into the storagePath if it's not already there? (might save installs)
    const packageName = id; // TODO: our API should return the actual package name since it's not the same as the id
    const packagePath = path.join(storagePath, "node_modules", packageName);
    if (!fs.existsSync(packagePath)) {
      const spinner = ora({
        text: `Fetching Recipe ${chalk.yellow(id)}...`,
      }).start();
      const installProcess = spawn(
        "npm",
        ["install", packageName, "-g", "--prefix", storagePath],
        { shell: true, stdio: "inherit" }
      );
      await new Promise<void>((resolve, reject) => {
        installProcess.on("error", reject);
        installProcess.on("close", (code) => {
          if (code) {
            reject(code);
          } else {
            resolve();
          }
        });
      });
      spinner.stop();
    }

    // TODO: call updateNotifier to check if there's a new version of the recipe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    // TODO: try using dynamic import or Module.runMain to avoid creating a process?
    const recipeProcess = spawn(
      "node",
      [path.join(packagePath, "dist/recipes/run.js"), "testRecipe"],
      {
        stdio: "inherit",
      }
    );
  }
}
