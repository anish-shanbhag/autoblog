import {
  NamedStep,
  RecipeParameters,
  RecipeStep,
  UnpublishedRecipe,
} from "./types";

let running = false;

// TODO: implement a `ctx` object which is available to Recipes that contain additional info
// like previous step names, whether the Recipe is running in a Template, etc.

// TODO: should this not be an actually implemented function, but rather just a build step when packaging?
// this may make it easier to dynamically get id and author
// but then again that might not be an issue anyway since package.json is usually included in node_modules even on NPM
// edge case: something like Yarn PnP where the package.json might not exist?
// TODO: during build, this needs to be converted into a PublishedRecipe
export function createRecipe({
  run,
  ...params
}: RecipeParameters): UnpublishedRecipe {
  // TODO: figure out how to do this without Object.assign (same for below functions)
  // eslint-disable-next-line prefer-object-spread
  return Object.assign(
    {},
    () => {
      if (!running) {
        throw Error(
          "It looks like you're trying to run this Recipe without the CLI or the `runRecipe` function, which probably isn't what you're trying to do."
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
// TODO: rename to `runWithScaffolding` since the parameter isn't actually a Recipe?
export function runRecipe(recipe: RecipeStep): void {
  // TODO: options for running in the context of a different directory
  running = true;
  recipe();
  running = false;
}

export function namedStep({
  name,
  outputMode = "hidden", // TODO: should this default to condensed instead?
  run,
}: {
  name: string;
  // there might be a better way to do this, but at least in terms of CLI:
  // collapsed would only show the step name and its progress
  // condensed would show the same thing as collapsed but also some greyed-out command output when the step is running
  // alert would print the step name before and after the command, but still show command output in between
  // hidden would not show the step name at all, and everything would act as normal (could be used for undo)
  // TODO: separate this out into multiple functions instead?
  outputMode: "collapsed" | "condensed" | "alert" | "hidden";
  run: RecipeStep;
}): NamedStep {
  // eslint-disable-next-line prefer-object-spread
  return Object.assign({}, run, { name, outputMode });
}
