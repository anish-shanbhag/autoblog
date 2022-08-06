import path from "path";

import { runProcess, recipeInstallPath } from "../src/utils";

export function createTest(
  dir: string,
  runTest: (ctx: {
    relativePath: (path: string) => string;
    uncache: (id: string) => Promise<void>;
    build: () => void;
    command: (...args: string[]) => Promise<void>;
  }) => void | Promise<void>
) {
  const name = path.basename(dir);
  const shellOptions = {
    cwd: `./test/fixtures/${name}/package`,
    shell: true,
  };
  describe(name, () => {
    runTest({
      relativePath: (pathName) => path.join(dir, "package", pathName),
      uncache: async (id) =>
        runProcess(
          "npm",
          [
            "uninstall",
            id,
            "-g",
            "--prefix",
            recipeInstallPath,
            "--loglevel",
            "error",
          ],
          { shell: true }
        ),
      build: () => {
        it("builds without errors", async () => {
          await runProcess("scaffold", ["build"], shellOptions);
        });
      },
      command: (...args: string[]) =>
        runProcess("scaffold", args, shellOptions),
    });
  });
}
