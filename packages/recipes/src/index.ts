import { NamedStep, Recipe, RecipeParameters, RecipeStep } from "./types";

// TODO: should this not be an actually implemented function, but rather just a build step when packaging?
// this may make it easier to dynamically get id and author
// but then again that might not be an issue anyway since package.json is usually included in node_modules even on NPM
// edge case: something like Yarn PnP where the package.json might not exist?
export function createRecipe({ run, ...params }: RecipeParameters): Recipe {
  // TODO: figure out how to do this without Object.assign (same for below functions)
  // eslint-disable-next-line prefer-object-spread
  return Object.assign({}, run, {
    ...params,
    id: "", // TODO
    author: "", // TODO
    fromNPM: true,
    official: false,
  });
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
