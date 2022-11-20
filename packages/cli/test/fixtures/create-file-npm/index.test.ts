import { existsSync } from "fs";
import fs from "fs/promises";

import { createTest } from "../../utils";

// TODO: currently installed runs aren't tested on Node <= 14 because
// NPM v6 doesn't support workspaces
const nodeVersion = parseInt(process.version.split(".")[0]);

createTest(__dirname, {
  testLocalRun: false,
  testInstallRun: nodeVersion > 14,
  testCachedRun: nodeVersion > 14,
  result(ctx) {
    expect(existsSync(ctx.relativePath("test.txt"))).toBe(true);
  },
  async undo(ctx) {
    await fs.rm(ctx.relativePath("test.txt"));
  },
});
