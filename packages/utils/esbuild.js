const { build } = require("esbuild");

const packageJson = require("./package.json");

const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: ["node14", "es2020"],
  logLevel: "info",
};

(async () => {
  await build({
    ...options,
    outfile: packageJson.main,
    format: "cjs",
  });
  await build({
    ...options,
    outfile: packageJson.module,
    format: "esm",
  });
})();
