import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

import { build, BuildOptions } from "esbuild";
import ora, { Ora } from "ora";
import chalk from "chalk";

import {
  getPackageJson,
  getPackageRoot,
  getRecipesEntryPointFromPath,
  getRecipesFromImport,
  runProcess,
} from "./utils";

export async function buildRecipes({ clean }: { clean?: string }) {
  const { packageRoot, fromRoot } = getPackageRoot();
  const pkg = await getPackageJson();

  const { recipesEntryPoint, hasTypeScriptEntryPoint } =
    await getRecipesEntryPointFromPath(packageRoot);

  // TODO: make sure file:// works on all platforms
  const recipes = await getRecipesFromImport("file://" + recipesEntryPoint);

  if (Object.keys(recipes).length === 0) {
    throw Error("No recipes were found to be built");
  }
  const relativeEntryPoint = path
    .relative(packageRoot, recipesEntryPoint)
    .replace(/\\/g, "/");
  const formattedRecipeNames = Object.keys(recipes)
    .map((name) => chalk.blue(name))
    .join(", ");
  console.log(
    `Building the following Recipes exported from ${relativeEntryPoint}: ${formattedRecipeNames}`
  );

  let spinner: Ora;
  if (clean) {
    spinner = ora(`Cleaning up ${chalk.yellow(clean)}...\n`).start();
    // TODO: support globs for the path to clean up
    await fs.rm(fromRoot(clean), { recursive: true, force: true });
    spinner.succeed(`Deleted old files in ${chalk.yellow(clean)}`);
  }

  let hasTSConfig = false;
  let searchPath = path.dirname(recipesEntryPoint);
  while (searchPath !== path.parse(searchPath).root) {
    if (existsSync(path.join(searchPath, "tsconfig.json"))) {
      hasTSConfig = true;
      break;
    }
    searchPath = path.dirname(searchPath);
  }

  if (hasTypeScriptEntryPoint && !hasTSConfig) {
    console.log(
      "It looks like you're using TypeScript, but you haven't set up a tsconfig.json file."
    );
    // TODO: automatically create a tsconfig.json
    hasTSConfig = true;
  }

  if (hasTSConfig) {
    spinner = ora("Checking validity of types...\n").start();
    try {
      await runProcess("tsc", [], { fullOutput: true });
    } catch {
      // TODO: properly check for and print errors that aren't actually due to incorrect types
      spinner.fail("Type checking failed.");
      return;
    }
    spinner.succeed("No TypeScript errors found");
  }

  spinner = ora("Bundling your package...\n").start();
  const builds = [];
  const commonOptions: Partial<BuildOptions> = {
    entryPoints: [recipesEntryPoint],
    platform: "node",
    sourcemap: true,
  };
  if ("main" in pkg) {
    builds.push(
      build({
        ...commonOptions,
        outfile: fromRoot(pkg.main as string), // TODO: validate that the path is a valid string
        format: "cjs",
      })
    );
  }
  if ("module" in pkg) {
    builds.push(
      build({
        ...commonOptions,
        outfile: fromRoot(pkg.module as string), // TODO: validate that the path is a valid string
        format: "esm",
      })
    );
  }
  if (builds.length === 0) {
    throw Error("Couldn't find a main or module field in package.json");
  }
  await Promise.all(builds);

  // TODO: include name of package in this message
  // TODO: only print that the package was also built if the recipes export is the same as "main" in package.json
  spinner.succeed("Successfully built Recipes");
}
