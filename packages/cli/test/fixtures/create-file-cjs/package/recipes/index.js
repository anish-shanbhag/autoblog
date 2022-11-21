const { createFile, createRecipe } = require("@cryo/recipes");

module.exports = {
  testRecipe: createRecipe({
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
  }),
};
