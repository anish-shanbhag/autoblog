import { build } from "esbuild";
import glob from "glob";
import { commonOptions } from "./esbuild.js";
(async () => {
  await build({
    ...commonOptions,
    entryPoints: glob.sync("test/**/*.ts"),
    outdir: "test/out",
    sourcemap: true,
  });
})();
