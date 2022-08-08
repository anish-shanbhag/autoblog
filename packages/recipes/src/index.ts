import fs from "fs/promises";

import { RecipeParameters, RecipeStep, Recipe } from "./types";

let running = false;
let initialized = false;
const steps: Record<string, string> = {};

// TODO: implement a `ctx` object which is available to Recipes that contain additional info
// like previous step names, whether the Recipe is running in a Template, etc.

export async function initializeRecipes() {
  // TODO: use `await import(process.cwd() + "/recipes")` to load all recipes
  // then, set their IDs and authors to the proper values
  initialized = true;
}

// TODO: should this not be an actually implemented function, but rather just a build step when packaging?
// this may make it easier to dynamically get id and author
// but then again that might not be an issue anyway since package.json is usually included in node_modules even on NPM
// edge case: something like Yarn PnP where the package.json might not exist?
// TODO: during build, this needs to be converted into a PublishedRecipe
export function createRecipe({ run, ...params }: RecipeParameters): Recipe {
  // TODO: figure out how to do this without Object.assign (same for below functions)
  // right now this is an anonymous function so it won't have a name when printed
  // eslint-disable-next-line prefer-object-spread
  return Object.assign(
    () => {
      if (!running) {
        throw Error(
          "It looks like you're trying to run this Recipe without the CLI or the `runRecipe` function, which isn't allowed because it might be dangerous."
        );
      } else {
        run();
      }
    },
    {
      ...params,
      fromNPM: true,
      official: false,
    }
  );
}

// TODO: should this even be a thing? Could be pretty dangerous since you can accidentally delete files
export async function runWithRecipeContext(
  recipe: RecipeStep,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { confirmDirectory = false, ...options }: { confirmDirectory?: boolean } = {
    confirmDirectory: false,
  }
): Promise<void> {
  // TODO: options for running in the context of a different directory
  // TODO: prompt to install the extension if it's not installed
  if (!initialized) initializeRecipes();
  running = true;
  // TODO: implement confirmDirectory functionality, which should prompt for the directory context for the Recipe if true
  recipe();
  running = false;
}

export async function namedStep({
  name,
  enableUndo = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  outputMode = "hidden", // TODO: should this default to condensed instead?
  run,
}: {
  name: string;
  enableUndo?: boolean;
  // there might be a better way to do this, but at least in terms of CLI:
  // collapsed would only show the step name and its progress
  // condensed would show the same thing as collapsed but also some greyed-out command output when the step is running
  // alert would print the step name before and after the command, but still show command output in between
  // hidden would not show the step name at all, and everything would act as normal (could be used for undo)
  // TODO: separate this out into multiple functions instead?
  outputMode: "collapsed" | "condensed" | "alert" | "hidden";
  run: RecipeStep;
}): Promise<void> {
  if (steps[name]) {
    throw Error(
      `Trying to create a step named ${name}, but that name has already been used.`
    );
  } else {
    // TODO: implement outputMode
    await run();
    steps[name] = "step";
    // TODO: need to save the current directory context/diffs so that we can undo to this step
    // but only do this if enableUndo is true, since this would probably be an expensive operation
  }
}

// the below methods should print messages to the console (extra functionality over regular fs call)
// TODO: move these to their own file?
export async function createFile(path: string, contents?: string) {
  // TODO: reimplement with fs.createWriteStream() for more performance? (hover fs.writeFile())
  await fs.writeFile(path, contents ?? "");
  // TODO: check mark emoji, etc.
  console.log("Created file " + path);
}

export async function deleteFile(path: string) {
  // TODO: red X emoji, etc.
  await fs.rm(path);
  console.log("Deleted file" + path);
}

export * from "./types";

// TODO: file operations with directories
// TODO: file operations on globs/arrays of paths (might just integrate into the above functions)
