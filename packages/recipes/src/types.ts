// TODO: use Zod for validation?
// TODO: add fields for automatic dependency updates, Snyk validation, etc.
// TODO: change the name of this interface
export interface RecipeParameters {
  title: string; // displayed as a title on the website; package name is separate and defined by package.json
  description: string;
  compatible?: string[]; // TODO: maybe choose a better name and make the type stricter
  incompatible?: string[];
  dependencies?: string[];
  unlisted?: boolean;
  private?: boolean; // TODO: should this be a paid feature? and is this necessary, or can a private NPM package do the same thing?
  run: RecipeStep; // TODO: this should be able to accept parameters as an object (see Notion)
}

// decided to omit fields like author, id, fromNPM, official, etc. and leave those for the website only
// there is basically no use for those fields in a programmatic context
export type Recipe = RecipeStep & Omit<RecipeParameters, "run">;

export type RecipeStep = (() => void) | (() => Promise<void>);

// TODO: need a way to safeguard against recipes running inside of the dev environment (e.g. from calling a recipe directly inside the file instead of inside functions)

/*

theoretical setup in a recipe package:

import { createRecipe, runCommand, namedStep, cloneRepo, usesComponent, undoToStep } from "@cryo/recipes";

export const recipe = createRecipe(
  title: "Create Next.js project",
  description: "Creates a new Next.js project",
  async run() {
    await runCommand("npm init -y");

    await namedStep({
      name: "Clone GitHub repo",
      async run() {
        await cloneRepo("https://github.com/anish-shanbhag/cryogen"));
      }
    });
    // or:
    await namedStep("Clone GitHub repo", () => cloneRepo("https://github.com/anish-shanbhag/cryogen"));
    // 2nd one is probably preferable to keep consistency with the other functions that don't use named parameters

    if (usesComponent("yarn", { confirm: true })) {
      await undoToStep("Clone GitHub repo");
    }
  }
);

*/
