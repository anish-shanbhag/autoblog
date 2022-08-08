import path from "path";
import fs from "fs/promises";

import {
  runProcess,
  recipeInstallPath,
  getPackageManagerFromPath,
} from "../src/utils";

export function createTest(
  dir: string,
  runTest: (ctx: {
    relativePath: (path: string) => string;
    uncache: (id: string) => Promise<void>;
    build: () => void;
    runCommand: (...args: Parameters<typeof runProcess>) => Promise<void>;
  }) => void | Promise<void>
) {
  const name = path.basename(dir);
  const packageDir = path.join(dir, "package");
  const relativePath = (pathName: string) => path.join(packageDir, pathName);
  async function runCommand(...args: Parameters<typeof runProcess>) {
    await runProcess(args[0], args[1] ?? [], {
      cwd: packageDir,
      ...args[2],
    });
  }
  describe(name, () => {
    jest.setTimeout(120000);
    it("can install dependencies", async () => {
      await Promise.all(
        ["node_modules", ".yalc", "yalc.lock"].map((file) =>
          fs.rm(relativePath(file), {
            recursive: true,
            force: true,
          })
        )
      );
      await runCommand("yalc add recipes --pure");
      await runCommand("yalc add cli -D --pure");
      const packageManager = await getPackageManagerFromPath(packageDir);
      await runCommand(packageManager, ["install"], {
        env: { ...process.env, YARN_ENABLE_IMMUTABLE_INSTALLS: "0" },
      });
    });
    runTest({
      relativePath,
      uncache: async (id) =>
        runProcess("npm", [
          "uninstall",
          id,
          "-g",
          "--prefix",
          recipeInstallPath,
          "--loglevel",
          "error",
        ]),
      build: () => {
        it("builds without errors", () =>
          runCommand("scaffold", ["build", "-c", "dist"]));
      },
      runCommand,
    });
  });
}
