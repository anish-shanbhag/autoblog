import path from "path";

import { runProcess, recipeInstallPath } from "../src/utils";

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
  async function runCommand(...args: Parameters<typeof runProcess>) {
    await runProcess(args[0], args[1], {
      cwd: `./test/fixtures/${name}/package`,
      ...args[2],
    });
  }
  describe(name, () => {
    runTest({
      relativePath: (pathName) => path.join(dir, "package", pathName),
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
        it("builds without errors", () => runCommand("scaffold build"));
      },
      runCommand,
    });
  });
}
