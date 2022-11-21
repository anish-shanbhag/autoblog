import { build } from "esbuild";

import pkg from "./package.json" assert { type: "json" };

(async () => {
  await build({
    entryPoints: ["src/index.ts", "src/cli.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    target: ["node14", "es2020"],
    sourcemap: true,
    splitting: true,
    outdir: "dist",
    external: Object.keys(pkg.dependencies),
    logLevel: "info",
  });
})();
