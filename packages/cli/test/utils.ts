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
    console.log("runCommand:", ...args);
    await runProcess(args[0], args[1], {
      cwd: packageDir,
      ...args[2],
    });
  }
  describe(name, () => {
    jest.setTimeout(120000);
    it("can install dependencies", async () => {
      const packageManager = await getPackageManagerFromPath(packageDir);
      await fs.rm(relativePath("node_modules"), {
        recursive: true,
        force: true,
      });
      await runCommand(packageManager, ["install"]);
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
        it("builds without errors", () => runCommand("scaffold build -c dist"));
      },
      runCommand,
    });
  });
}
