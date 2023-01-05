import { build } from "esbuild";
import { buildOptions } from "./esbuild.js";

(async () => {
  await build({
    ...buildOptions,
    watch: true,
    sourcemap: true,
  });
})();
