import fs from "fs/promises";

import { build } from "esbuild";

import pkg from "./package.json" assert { type: "json" };

(async () => {
  await fs.rm("dist", { recursive: true, force: true });
  await build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    platform: "node",
    format: "esm",
    sourcemap: true,
    outfile: "dist/index.js",
    external: Object.keys(pkg.dependencies),
    logLevel: "info",
  });
})();
