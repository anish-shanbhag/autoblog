import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

import {
  runProcess,
  getPackageManagerFromPath,
  getPackageJsonFromDirectory,
  uncachePackage,
} from "../src/utils";

interface TestCtx {
  relativePath: (...args: string[]) => string;
}

export function createTest(
  dir: string,
  options: {
    testLocalRun?: boolean;
    testInstallRun?: boolean;
    testCachedRun?: boolean;
    result: (ctx: TestCtx) => void;
    undo?: (ctx: TestCtx) => void | Promise<void>;
  }
) {
  const name = path.basename(dir);
  const packageDir = path.join(dir, "package");
  const relativePath = (pathName: string) => path.join(packageDir, pathName);
  async function runCommand(...args: Parameters<typeof runProcess>) {
    return runProcess(args[0], args[1], {
      cwd: packageDir,
      ...args[2],
    });
  }
  describe(name, () => {
    jest.setTimeout(120000);

    if (process.env.FULL_OUTPUT) {
      const padding = "=".repeat(30);
      process.stdout.write(`${padding} BEGIN TEST ${name} ${padding}\n`);
    }

    it("can install dependencies", async () => {
      await Promise.all(
        ["node_modules", ".yalc", "yalc.lock"].map(async (file) => {
          if (existsSync(relativePath(file))) {
            await fs.rm(relativePath(file), {
              recursive: true,
              force: true,
            });
          }
        })
      );

      await runCommand("yalc", ["add", "@cryo/utils", "--pure"]);
      await runCommand("yalc", ["add", "@cryo/recipes", "--pure"]);
      await runCommand("yalc", ["add", "@cryo/cli", "-D", "--pure"]);

      const packageManager = await getPackageManagerFromPath(packageDir);

      // this is a hack which makes sure that PNPM and Yarn can resolve our
      // local packages' subdependencies
      async function patchDependencies(
        packageName: string,
        dependencies: string[]
      ) {
        const pkg = await getPackageJsonFromDirectory(
          relativePath(".yalc/@cryo/" + packageName)
        );
        for (const dependency of dependencies) {
          (pkg.dependencies as Record<string, string>)["@cryo/" + dependency] =
            "file:../" +
            (packageManager === "npm" ? "" : "../") +
            "@cryo/" +
            dependency;
        }
        await fs.writeFile(
          relativePath(`.yalc/@cryo/${packageName}/package.json`),
          JSON.stringify(pkg, null, 2)
        );
      }

      await patchDependencies("cli", ["recipes", "utils"]);
      await patchDependencies("recipes", ["utils"]);

      await runCommand(packageManager, ["install"], {
        env: { ...process.env, YARN_ENABLE_IMMUTABLE_INSTALLS: "0" },
      });
    });

    beforeAll(() => uncachePackage(name));
    afterAll(() => uncachePackage(name));

    async function runTest(...args: Parameters<typeof runCommand>) {
      await runCommand(...args);
      options.result({ relativePath });
      if (options.undo) {
        // TODO: once you write diffing functionality, just use that to revert changes instead
        await options.undo({ relativePath });
      }
    }

    it("builds without errors", () =>
      runCommand("cryo", ["build", "-c", "dist"]));

    if (options.testLocalRun) {
      it("runs properly without an install", () =>
        runTest("cryo", ["local", "run"]));
    }
    if (options.testInstallRun) {
      it("runs properly if installed", () =>
        runTest("cryo", ["local", "run", "--install"]));
    }
    if (options.testCachedRun) {
      it("runs properly when cached", () =>
        runTest("cryo", ["local", "run", "--install"]));
    }
  });
}
