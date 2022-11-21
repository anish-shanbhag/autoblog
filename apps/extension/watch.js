const { build } = require("esbuild");
const { commonOptions } = require("./esbuild.js");

(async () => {
  await build({
    ...commonOptions,
    watch: true,
    sourcemap: true,
  });
})();
