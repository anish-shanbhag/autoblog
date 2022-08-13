import path from "path";
import { existsSync } from "fs";

import chalk from "chalk";

import {
  getPackageJsonFromDirectory,
  getPackageRoot,
  getRecipesEntryPointFromPath,
} from "./utils";
import { runRecipeFromImport, runRecipeWithId } from "./run";

export async function runLocalRecipe(
  name: string,
  options: { path?: string; install?: boolean } = {}
) {
  let packageRoot: string;
  if (options.path) {
    packageRoot = path.join(process.cwd(), options.path);
    if (!existsSync(path.join(packageRoot, "package.json"))) {
      throw new Error(
        `The path ${chalk.yellow(
          packageRoot
        )} which was provided for --path is invalid because it does not contain a package.json file. Please provide a path to a valid NPM package.`
      );
    }
  } else {
    packageRoot = getPackageRoot().packageRoot;
  }
  if (options.install) {
    const pkg = await getPackageJsonFromDirectory(packageRoot);
    if (typeof pkg.name !== "string" && typeof pkg.version !== "string") {
      throw new Error(
        `The package.json file in ${chalk.yellow(
          packageRoot
        )} is invalid. Please make sure it has the "name" and "version" properties.`
      );
    }
    // TODO: right now, the --install option just symlinks the package to the
    // recipe install path. Ideally though, we would want to `pack` the package
    // and then install it in order to be as functionally close to a real install
    // as possible. However, this doesn't work properly with workspaces since any
    // workspace packages defined in the recipe package would need to be installed
    // individually (maybe even recursively). Since that would be pretty complicated
    // it's not implemented for now.
    // TODO: Maybe consider just moving this option's functionality to a
    // `cryo test run` command since this has almost no use for anyone
    // who isn't developing Recipes.
    await runRecipeWithId(pkg.name + (name ? name + "/" : ""), {
      path: packageRoot,
      version: pkg.version as string,
    });
  } else {
    const { recipesEntryPoint } = await getRecipesEntryPointFromPath(
      packageRoot
    );
    await runRecipeFromImport("file://" + recipesEntryPoint, name);
    // TODO: the import above will typecheck the entry file, but this can be disabled
    // with the transpileOnly option in ts-node. To increase performance we could have
    // a --skip-typecheck flag which would spawn a new ts-node process with --transpileOnly,
    // but the need to spawn a process may not be compatible with the way recipes are run.
  }
}
