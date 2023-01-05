const { build } = require("esbuild");

const pkg = require("./package.json");

const commonOptions = {
  bundle: true,
  platform: "node",
  format: "cjs",
  target: ["node14", "es2020"],
  sourcemap: true,
  external: Object.keys(pkg.dependencies),
  logLevel: "info",
};

(async () => {
  await build({
    ...commonOptions,
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.cjs",
  });
  await build({
    ...commonOptions,
    entryPoints: ["src/cli.ts"],
    outfile: "dist/cli.js",
  });
})();
