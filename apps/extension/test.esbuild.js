const { build } = require("esbuild");
const glob = require("glob");
const { commonOptions } = require("./esbuild.js");
(async () => {
  await build({
    ...commonOptions,
    entryPoints: glob.sync("test/**/*.ts"),
    outdir: "test/out",
    sourcemap: true,
  });
})();
