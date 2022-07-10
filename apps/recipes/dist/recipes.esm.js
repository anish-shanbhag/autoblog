var sum = function sum(a, b) {
  if ("development" === process.env.NODE_ENV) {
    console.log("dev only output");
  }

  return a + b;
};

export { sum };
//# sourceMappingURL=recipes.esm.js.map
