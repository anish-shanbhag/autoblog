import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

import chalk from "chalk";
import { build, BuildOptions } from "esbuild";
import ora, { Ora } from "ora";

import {
  getBuildEntryPointFromPackage,
  getPackageJsonFromDirectory,
  getPackageRootFromPath,
  getRecipesEntryPointFromPath,
  getRecipesFromImport,
  runProcess,
} from "./utils";

export async function buildRecipes(
  options: { path?: string; clean?: string; skipTypecheck?: boolean } = {}
) {
  const { packageRoot, fromRoot } = getPackageRootFromPath(
    options.path ?? process.cwd()
  );
  const pkg = await getPackageJsonFromDirectory(packageRoot);
  const { recipesEntryPoint, hasTypeScriptEntryPoint } =
    await getRecipesEntryPointFromPath(packageRoot);

  const relativeEntryPoint = path
    .relative(packageRoot, recipesEntryPoint)
    .replace(/\\/g, "/");

  console.log(
    `Building Recipes exported from ${chalk.yellow(relativeEntryPoint)}`
  );

  let spinner: Ora;
  if (options.clean) {
    spinner = ora(`Cleaning up ${chalk.yellow(options.clean)}...\n`).start();
    // TODO: support globs for the path to clean up
    await fs.rm(fromRoot(options.clean), { recursive: true, force: true });
    spinner.succeed(`Deleted old files in ${chalk.yellow(options.clean)}`);
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

  // TODO: add another check to make sure that the TSConfig actually includes the entry point

  if (hasTypeScriptEntryPoint && !hasTSConfig) {
    console.log(
      "It looks like you're using TypeScript, but you haven't set up a tsconfig.json file."
    );
    // TODO: automatically create a tsconfig.json
    hasTSConfig = true;
  }

  if (hasTypeScriptEntryPoint && hasTSConfig && !options.skipTypecheck) {
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

  const recipes = await getRecipesFromImport(
    "file://" + (await getBuildEntryPointFromPackage(packageRoot))
  );

  if (Object.keys(recipes).length === 0) {
    spinner.fail(
      "The package built successfully, but no Recipes were found in the output."
    );
  } else {
    const formattedRecipeNames = Object.keys(recipes)
      .map((name) => chalk.blue(name))
      .join(", ");
    spinner.succeed("Successfully built Recipes: " + formattedRecipeNames);
  }
}
