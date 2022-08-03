import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { execSync } from "child_process";

import { build, BuildOptions } from "esbuild";
import ora, { Ora } from "ora";
import chalk from "chalk";

import { runProcess } from "./utils";

export async function buildRecipes({ clean }: { clean?: string }) {
  let packageRoot = process.cwd();
  while (!existsSync(path.join(packageRoot, "package.json"))) {
    if (packageRoot === path.parse(process.cwd()).root) {
      throw new Error(
        "Couldn't find a package.json file. Try running this command again from inside a package."
      );
    }
    packageRoot = path.dirname(packageRoot);
  }

  function fromRoot(relativePath: string) {
    return path.join(packageRoot, relativePath);
  }

  const pkg = JSON.parse(
    (await fs.readFile(fromRoot("package.json"))).toString()
  ) as Record<string, unknown>;

  let recipesEntryPoint; // TODO: allow this to be overriden and skip the checks below if it is
  let hasTypeScriptEntryPoint = false;
  if (existsSync(fromRoot("recipes/index.ts"))) {
    recipesEntryPoint = fromRoot("recipes/index.ts");
    hasTypeScriptEntryPoint = true;
  } else if (existsSync(fromRoot("recipes/index.js"))) {
    recipesEntryPoint = fromRoot("recipes/index.js");
  } else {
    throw Error("Couldn't find a entry point for recipes.");
  }

  // TODO: make sure file:// works on all platforms
  const recipes = (await import(
    // TODO: type the main and module fields properly before this
    "file://" + recipesEntryPoint
  )) as Record<string, unknown>;
  // TODO: use a runtime check (e.g. Zod) to filter which exports are actually Recipes
  const recipeNames = Object.keys(recipes);
  const relativeEntryPoint = path
    .relative(packageRoot, recipesEntryPoint)
    .replace(/\\/g, "/");
  const formattedRecipeNames = recipeNames
    .map((name) => chalk.blue(name))
    .join(", ");
  console.log(
    `Building the following Recipes exported from ${relativeEntryPoint}: ${formattedRecipeNames}`
  );

  let spinner: Ora;
  if (clean) {
    spinner = ora(`Cleaning up ${chalk.yellow(clean)}...\n`).start();
    if (existsSync(fromRoot(clean))) {
      await fs.rm(fromRoot(clean), { recursive: true, force: true });
    } else {
      throw Error("The path provided for --clean doesn't exist.");
    }
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
      const binPath = execSync("npm bin").toString().trim();
      await runProcess("tsc", [], {
        stdio: "inherit",
        shell: true,
        env: {
          ...process.env,
          PATH: process.env.PATH + ";" + binPath,
        },
      });
    } catch (e) {
      // TODO: properly check for and print errors that aren't actually due to incorrect types
      console.error(e);
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
