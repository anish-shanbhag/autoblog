import path from "path";

import { runProcess, recipeInstallPath } from "../src/utils";

export function createTest(
  dir: string,
  runTest: (ctx: {
    relativePath: (path: string) => string;
    uncache: (id: string) => Promise<void>;
    build: () => void;
    run: (id: string) => Promise<void>;
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
          ["uninstall", id, "-g", "--prefix", recipeInstallPath], // TODO: change id to packageName depending on how input is handled
          { shell: true }
        ),
      build: () => {
        it("builds without errors", async () => {
          await runProcess("scaffold", ["build"], shellOptions);
        });
      },
      run: (id) => runProcess("scaffold", ["run", id], shellOptions),
    });
  });
}
