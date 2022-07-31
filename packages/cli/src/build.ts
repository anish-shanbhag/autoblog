import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

import { build } from "esbuild";
import ora from "ora";
import chalk from "chalk";

export async function buildRecipes() {
  await fs.rm("dist", { recursive: true, force: true });
  let spinner = ora("Checking validity of types...\n").start();
  try {
    await new Promise<void>((resolve, reject) => {
      // it looks like spawn() only works if typescript is installed as a dependency in the recipe package
      const tsc = spawn("tsc", { stdio: "inherit", shell: true });
      tsc.on("error", reject);
      tsc.on("close", (code) => {
        if (code) {
          reject(code);
        } else {
          resolve();
        }
      });
    });
  } catch {
    spinner.fail("Type checking failed.");
    return;
  }
  spinner.succeed("No TypeScript errors found");
  // TODO: add a config option which allows for building to both ESM and CommonJS
  spinner = ora("Bundling your package...\n").start();
  await build({
    entryPoints: ["recipes/index.ts"],
    platform: "node",
    outdir: "dist",
    bundle: true,
    external: ["recipes"],
    format: "esm",
  });
  // TODO: make sure file:// works on all platforms
  const recipes = (await import(
    "file://" + path.join(process.cwd(), "dist/index.js")
  )) as Record<string, unknown>;
  // TODO: use a runtime check (e.g. Zod) to filter which exports are actually Recipes
  const recipeNames = Object.keys(recipes);
  await fs.mkdir("dist/recipes");
  await fs.writeFile(
    path.join("dist/recipes/names.json"),
    JSON.stringify(recipeNames)
  );
  await fs.writeFile(
    "dist/recipes/run.js",
    'import { runWithRecipeContext } from "recipes";\n' +
      'import * as recipes from "../index.js";\n' +
      "runWithRecipeContext(() => recipes[process.argv[2]]());\n"
  );
  spinner.succeed(
    `Successfully built package and Recipe${
      recipeNames.length > 1 ? "s" : ""
    }: ${recipeNames.map((name) => chalk.yellow(name)).join(", ")}`
  );
}
