#!/usr/bin/env node

import { Command } from "commander";

import { buildRecipes } from "./build";
import { runRecipeWithId } from "./run";

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
  .action(buildRecipes);

program.parse();
