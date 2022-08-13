#!/usr/bin/env node

import { fileURLToPath } from "url";
import { fork } from "child_process";

import { Command } from "commander";

import { buildRecipes } from "./build";
import { runLocalRecipe } from "./local";
import { runRecipeWithId } from "./run";

// TODO: add the update-notifier package to notify when the CLI is updated
// or, just update without asking since there's few cases where users wouldn't
// want the latest version

let program: Command;

function showErrors(action: (...args: any[]) => Promise<void>) {
  // this is needed for Node 14 specifically since Promises don't throw errors
  return async (...args: any[]) => {
    try {
      await action(...args);
    } catch (e) {
      program.error((e as { stack: string }).stack);
    }
  };
}

if (process.execArgv.length === 0) {
  // restart the script with the necessary Node flags
  // TODO: if importing the CLI package directly in the extension then these flags
  // will need to be set in the extension itself
  // TODO: figure out when the loader API used below will become stable
  fork(fileURLToPath(import.meta.url), process.argv.slice(2), {
    execArgv: [
      "--loader=ts-node/esm",
      "--experimental-specifier-resolution=node",
      "--no-warnings",
    ],
  });
} else {
  program = new Command();
  program.name("Cryogen").description("").version("0.1.0"); // TODO

  program
    .command("run")
    .description("Run a Recipe with the given ID")
    .argument(
      "<id>",
      "ID of the Recipe to run, in the form of [@scope]package[@version][/name]"
    )
    .action(showErrors((id: string) => runRecipeWithId(id)));

  program
    .command("local")
    .description("Use the `local run` command to run a locally-defined Recipe")
    .command("run")
    .description("Run a Recipe defined in a local file")
    .argument("[name]", "The name of the Recipe to be run")
    // path is an option and not an argument because of the ambuigity between "local run path" and "local run name"
    .option(
      "-p, --path <path>",
      "Path to a package containing the Recipe to run"
    )
    .option(
      "-i, --install",
      "Installs the Recipe to the cache before running it, just like a non-local Recipe"
    )
    .action(showErrors(runLocalRecipe));

  program
    .command("build")
    .description("Build the Recipe(s) defined in this package")
    .option(
      "-c, --clean <path>",
      "Delete files at the given path before building"
    )
    .action(showErrors(buildRecipes));

  program.parse();
}
