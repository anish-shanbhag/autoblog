import { Recipe, RecipeParameters } from "./types";

// TODO: should this not be an actually implemented function, but rather just a build step when packaging?
export function createRecipe({ run, ...params }: RecipeParameters): Recipe {
  return Object.assign(run, {
    ...params,
    id: "", // TODO
    author: "", // TODO
    fromNPM: true,
    official: false,
  });
}
