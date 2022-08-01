import { createFile, createRecipe } from "recipes";

export const testRecipe = createRecipe({
  title: "",
  description: "",
  compatible: [],
  dependencies: [],
  incompatible: [],
  private: false,
  unlisted: false,
  async run() {
    createFile("test.txt", "test");
  },
});
