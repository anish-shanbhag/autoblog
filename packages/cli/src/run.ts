import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

import chalk from "chalk";
import ora from "ora";
import semver from "semver";
import validate from "validate-npm-package-name";
import { Recipe, runWithRecipeContext } from "recipes";

import cliPkg from "../package.json";

import {
  runProcess,
  getPackageJson,
  recipeInstallPath,
  getPackageJsonFromDirectory,
  readJson,
  CACHE_DURATION,
  getRecipesFromImport,
  getRecipesEntryPointFromPath,
} from "./utils";
import { PackageMetadata } from "./types";

// TODO: what if there's no internet connection?

export async function runRecipeWithId(
  id: string,
  localPackage?: { path: string; version: string }
) {
  const invalidError = new Error("Invalid recipe ID: " + chalk.yellow(id));
  // TODO: improve this regex or just remove it
  if (!/(@.+)?.+(@.+)?(\/\w+)?/.test(id)) {
    throw invalidError;
  }

  const splitId = id.split("/");
  let packageSpec: string, recipeName: string;
  // need to avoid the ambiguity with @scope/package referring to a package
  // while package/name refers to a specific recipe in a package
  if (id.startsWith("@")) {
    if (splitId.length === 1 || splitId.length > 3) {
      throw invalidError;
    } else {
      packageSpec = splitId[0] + "/" + splitId[1];
      recipeName = splitId[2];
    }
  } else {
    if (splitId.length > 2) {
      throw invalidError;
    } else {
      packageSpec = splitId[0];
      recipeName = splitId[1];
    }
  }

  let packageName = packageSpec;
  let packageVersion: string | null = null;

  if (/.+@/.test(packageSpec)) {
    const splitByAt = packageSpec.split("@");
    packageVersion = splitByAt.pop()!;
    packageName = splitByAt.join("@");
  }

  const { validForNewPackages } = validate(packageName);
  if (!validForNewPackages) {
    throw Error(chalk.yellow(packageName) + " is not a valid NPM package name");
  }

  let pkg: Record<string, unknown> | null = null;
  try {
    pkg = await getPackageJson();
  } catch {
    // TODO: only continue if the error is actually due to package.json not being found
  }

  if (
    !packageVersion &&
    pkg &&
    ((pkg.dependencies &&
      packageName in (pkg.dependencies as Record<string, string>)) || // TODO: use Zod instead of type assertion
      (pkg.devDependencies &&
        packageName in (pkg.devDependencies as Record<string, string>)))
  ) {
    // resolve the package name using Node if it's declared as a dependency
    await runRecipeFromImport(packageName, recipeName);
    return;
  }

  let matched = false;
  const nodeModules = path.join(recipeInstallPath, "node_modules");
  const packagePath = path.join(nodeModules, packageName);
  if (packageVersion === "latest") packageVersion = null;
  const metadataPath = path.join(
    recipeInstallPath,
    "../metadata/package-metadata.json"
  );
  const metadata = existsSync(metadataPath)
    ? ((await readJson(metadataPath)) as PackageMetadata)
    : null;

  if (
    existsSync(packagePath) &&
    (await fs.stat(packagePath)).isDirectory() &&
    (!metadata ||
      !metadata[packageName] ||
      metadata[packageName].isLocal === Boolean(localPackage))
  ) {
    if (packageVersion) {
      // check if an installed package matches the requested version
      const pkg = await getPackageJsonFromDirectory(packagePath);
      if (
        pkg.version &&
        // eslint-disable-next-line import/no-named-as-default-member
        semver.satisfies(pkg.version as string, packageVersion)
      ) {
        matched = true;
      }
    } else if (metadata) {
      if (
        packageName in metadata &&
        Date.now() - metadata[packageName].lastInstalled < CACHE_DURATION
      ) {
        matched = true;
        // TODO: check for updates in the background and write to metadata if there is one
        // don't necessarily install the new package right away (as that might interfere with
        // the running recipe). Instead, install it the next time the recipe is run.
      }
    }
  }

  if (!matched) {
    // TODO: possibly first call our API instead, which could save network calls and allow for optimization
    // TODO: install the @scaffolding/recipes package into the storagePath if it's not already there? (might save installs)
    const spinner = ora({
      text:
        (localPackage ? "Installing" : "Fetching") +
        ` package ${chalk.yellow(packageName)}...\n`,
    }).start();

    const installSpec = localPackage ? localPackage.path : id;

    await runProcess(
      "npm",
      ["install", installSpec, "-g", "--prefix", recipeInstallPath],
      { shell: true }
    );

    if (!packageVersion) {
      // write metadata
      const newMetadata: PackageMetadata = metadata ?? {};
      newMetadata[packageName] = {
        ...newMetadata[packageName],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        cliVersion: cliPkg.version as string,
        lastInstalled: Date.now(),
        isLocal: Boolean(localPackage),
      };

      const metadataDirectory = path.dirname(metadataPath);
      if (!existsSync(metadataDirectory)) {
        await fs.mkdir(metadataDirectory);
      }
      await fs.writeFile(metadataPath, JSON.stringify(newMetadata, null, 2));
    }

    spinner.stop();
  }

  try {
    const { recipesEntryPoint } = await getRecipesEntryPointFromPath(
      packagePath
    );
    // TODO: make sure that file:// works on all platforms
    await runRecipeFromImport("file://" + recipesEntryPoint, recipeName);
  } catch (e) {
    // remove the package from the cache if it doesn't have an entry point
    // TODO: only handle the error this way if it was from a missing entry
    // point or from no Recipes being exported - actual errors from the Recipe
    // should be handled differently
    await runProcess(
      "npm",
      ["uninstall", packageName, "-g", "--prefix", recipeInstallPath],
      { shell: true }
    );
    throw e;
  }
}

export async function runRecipeFromImport(importString: string, name?: string) {
  const recipes = await getRecipesFromImport(importString);
  if (Object.keys(recipes).length === 0) {
    throw Error("No recipes were found in this package.");
  }
  let recipe: Recipe;
  if (!name) {
    if (Object.keys(recipes).length > 1) {
      throw Error(
        "Multiple recipes are declared in this package but no name was provided. " +
          "Please include a recipe name from the following list: " +
          Object.keys(recipes)
            .map((name) => chalk.blue(name))
            .join(", ")
      );
    } else {
      recipe = Object.values(recipes)[0];
    }
  } else {
    if (!(name in recipes)) {
      throw Error(
        "No recipe with the name " +
          chalk.yellow(name) +
          " was found in this package. The available recipes in this package are: " +
          Object.keys(recipes)
            .map((name) => chalk.blue(name))
            .join(", ")
      );
    } else {
      recipe = recipes[name];
    }
  }
  const spinner = ora({
    text: recipe.title + "\n",
  });
  await runWithRecipeContext(recipe);
  spinner.succeed();
}
