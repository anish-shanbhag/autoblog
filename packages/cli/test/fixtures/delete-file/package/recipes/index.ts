import { createRecipe, deleteFile } from "@cryo/recipes";

export const testRecipe = createRecipe({
  title: "Delete file.txt",
  description: "",
  compatible: [],
  dependencies: [],
  incompatible: [],
  private: false,
  unlisted: false,
  async run() {
    await deleteFile("file.txt");
  },
});
