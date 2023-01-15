const { build } = require("esbuild");
const { buildOptions } = require("./esbuild.js");

(async () => {
  await build({
    ...buildOptions,
    watch: true,
    sourcemap: true,
    minify: false,
  });
})();
