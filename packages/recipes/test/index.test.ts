import { createRecipe, namedStep } from "../src";

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

describe("namedStep", () => {
  it("creates a named step", () => {
    expect(
      namedStep({
        name: "Download repo",
        outputMode: "alert",
        run: () => {},
      })
    ).toBe(null); // TODO: fix this
  });
});
