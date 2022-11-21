const { build } = require("esbuild");

const commonOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "dist/extension.js",
  external: ["vscode", "esbuild"],
  logLevel: "info",
};

(async () => {
  await build(commonOptions);
})();

module.exports = {
  commonOptions,
};
