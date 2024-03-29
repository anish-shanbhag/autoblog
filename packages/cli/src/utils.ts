import { existsSync } from "fs";
import path from "path";

import {
  deleteMetadataFile,
  readJson,
  recipeInstallPath,
  runProcess,
} from "@cryo/node-utils";
import { Recipe } from "@cryo/recipes";
import chalk from "chalk";

// TODO: allow this to be customized
export const CACHE_DURATION = 1000 * 60 * 60 * 24; // 1 day

export function getPackageRootFromPath(filePath: string) {
  let packageRoot = filePath;
  while (!existsSync(path.join(packageRoot, "package.json"))) {
    if (packageRoot === path.parse(process.cwd()).root) {
      throw new Error(
        "Couldn't find a package.json file. Try running this command again from inside a package"
      );
    }
    packageRoot = path.dirname(packageRoot);
  }
  return {
    packageRoot,
    fromRoot: (relativePath: string) => path.join(packageRoot, relativePath),
  };
}

export function getPackageRoot() {
  return getPackageRootFromPath(process.cwd());
}

export function getInstalledPackagePath(packageName: string) {
  const nodeModules = path.join(
    recipeInstallPath,
    process.platform === "win32" ? "node_modules" : "lib/node_modules"
  );
  return path.join(nodeModules, packageName);
}

export async function getPackageJsonFromDirectory(packageRoot: string) {
  return readJson(path.join(packageRoot, "package.json"));
}

export async function getPackageJson() {
  const { packageRoot } = getPackageRoot();
  return getPackageJsonFromDirectory(packageRoot);
}

// TODO: these package manager functions are unused for now but may be useful in the future
export async function getPackageManagerFromPath(
  filePath: string
): Promise<string> {
  const { packageRoot, fromRoot } = getPackageRootFromPath(filePath);
  const pkg = await getPackageJsonFromDirectory(packageRoot);
  for (const packageManager of ["npm", "yarn", "pnpm"]) {
    if (
      typeof pkg.packageManager === "string" &&
      pkg.packageManager.startsWith(packageManager)
    ) {
      return packageManager;
    }
  }
  if (existsSync(fromRoot("pnpm-lock.yaml"))) {
    return "pnpm";
  } else if (existsSync(fromRoot("yarn.lock"))) {
    return "yarn";
  } else if (existsSync(fromRoot("package-lock.json"))) {
    return "npm";
  }
  return getPackageManagerFromPath(fromRoot("../"));
}

export function getPackageManager() {
  return getPackageManagerFromPath(process.cwd());
}

export async function getBuildEntryPointFromPackage(packagePath: string) {
  const packageJson = await getPackageJsonFromDirectory(packagePath);
  const entryPoint = path.join(
    packagePath,
    (packageJson.module as string | undefined) ?? (packageJson.main as string)
  );
  return entryPoint;
}

export async function getRecipesEntryPointFromPath(packageRoot: string) {
  const fromRoot = (relativePath: string) =>
    path.join(packageRoot, relativePath);
  const { name } = await getPackageJsonFromDirectory(packageRoot);
  let recipesEntryPoint; // TODO: allow this to be overriden and skip the checks below if it is
  let hasTypeScriptEntryPoint = false;
  if (existsSync(fromRoot("recipes/index.ts"))) {
    recipesEntryPoint = fromRoot("recipes/index.ts");
    hasTypeScriptEntryPoint = true;
  } else if (existsSync(fromRoot("recipes/index.js"))) {
    recipesEntryPoint = fromRoot("recipes/index.js");
  } else {
    throw Error(
      `Couldn't find an entry point for Recipes defined in the package ${chalk.yellow(
        name
      )}.`
    );
  }
  return { recipesEntryPoint, hasTypeScriptEntryPoint };
}

export async function getRecipesFromImport(importString: string): Promise<{
  [name: string]: Recipe;
}> {
  // TODO: error handling
  // TODO: filter the exports with Zod so that only recipes are included
  const exports = (await import(importString)) as { [name: string]: Recipe };
  return Object.keys(exports)
    .filter((key) => key !== "default")
    .reduce(
      (recipes, key) => ({
        ...recipes,
        [key]: exports[key],
      }),
      {}
    );
}

export async function uncachePackage(packageName: string) {
  if (existsSync(getInstalledPackagePath(packageName))) {
    await runProcess("npm", [
      "uninstall",
      packageName,
      "-g",
      "--prefix",
      recipeInstallPath,
      "--loglevel",
      "error",
    ]);
  }
  await deleteMetadataFile(packageName);
}
