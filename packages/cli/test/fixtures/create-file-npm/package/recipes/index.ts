import { createFile, createRecipe } from "recipes";

export const testRecipe = createRecipe({
  title: "Create file test.txt",
  description: "",
  compatible: [],
  dependencies: [],
  incompatible: [],
  private: false,
  unlisted: false,
  async run() {
    await createFile("test.txt", "test");
  },
});
