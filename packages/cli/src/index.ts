#!/usr/bin/env node --loader ts-node/esm --no-warnings
// TODO: figure out when the loader API used above will become stable

import { Command } from "commander";

import { buildRecipes } from "./build";
import { runRecipeWithId } from "./run";

// TODO: add the update-notifier package to notify when the CLI is updated
// or, just update without asking since there's few cases where users wouldn't
// want the latest version

const program = new Command();
program.name("scaffold").description("").version("0.0.0"); // TODO

// TODO: separate these out into the corresponding command files
program
  .command("run")
  .description("Run a Recipe with the given ID")
  .argument("<id>", "ID of the Recipe to run")
  .action(runRecipeWithId);

program
  .command("build")
  .description("Build the Recipe(s) defined in this package")
  .option(
    "-c, --clean [path]",
    "Delete files at the given path before building"
  )
  .action(buildRecipes);

program.parse();
