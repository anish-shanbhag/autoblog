import { createRecipe } from "../src";

describe("createRecipe", () => {
  it("creates a new recipe", () => {
    expect(
      createRecipe({
        title: "",
        description: "",
        compatible: [],
        dependencies: [],
        incompatible: [],
        private: false,
        unlisted: false,
        async run() {},
      })
    ).toBe(null); // TODO: fix this
  });
});
