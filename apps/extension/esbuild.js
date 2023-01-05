import { build } from "esbuild";

export const commonOptions = {
  bundle: true,
  platform: "node",
  format: "cjs",
  outExtension: { ".js": ".cjs" },
  external: ["vscode", "esbuild"],
  logLevel: "info",
};

export const buildOptions = {
  ...commonOptions,
  entryPoints: ["src/extension.ts"],
  outfile: "dist/extension.cjs",
};

(async () => {
  await build(buildOptions);
})();
