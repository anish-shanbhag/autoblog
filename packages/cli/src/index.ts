#!/usr/bin/env -S 'node --loader=ts-node/esm --experimental-specifier-resolution=node --no-warnings'
// TODO: figure out when the loader API used above will become stable

import { Command } from "commander";

import { buildRecipes } from "./build";
import { runLocalRecipe } from "./local";
import { runRecipeWithId } from "./run";

// TODO: add the update-notifier package to notify when the CLI is updated
// or, just update without asking since there's few cases where users wouldn't
// want the latest version

export const program = new Command();
program.name("scaffold").description("").version("0.1.0"); // TODO

program
  .command("run")
  .description("Run a Recipe with the given ID")
  .argument(
    "<id>",
    "ID of the Recipe to run, in the form of [@scope]package[@version][/name]"
  )
  .action((id: string) => runRecipeWithId(id));

program
  .command("local")
  .description("Use the `local run` command to run a locally-defined Recipe")
  .command("run")
  .description("Run a Recipe defined in a local file")
  .argument("[name]", "The name of the Recipe to be run")
  // path is an option and not an argument because of the ambuigity between "local run path" and "local run name"
  .option("-p, --path <path>", "Path to a package containing the Recipe to run")
  .option(
    "-i, --install",
    "Installs the Recipe to the cache before running it, just like a non-local Recipe"
  )
  .action(runLocalRecipe);

program
  .command("build")
  .description("Build the Recipe(s) defined in this package")
  .option(
    "-c, --clean <path>",
    "Delete files at the given path before building"
  )
  .action(buildRecipes);

program.parse();
