const { build } = require("esbuild");

const commonOptions = {
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["vscode", "esbuild", "@parcel/watcher"],
  logLevel: "info",
};

const buildOptions = {
  ...commonOptions,
  entryPoints: ["src/extension.ts"],
  outfile: "dist/extension.js",
  minify: true,
};

(async () => {
  await build(buildOptions);
})();

module.exports = { buildOptions, commonOptions };
