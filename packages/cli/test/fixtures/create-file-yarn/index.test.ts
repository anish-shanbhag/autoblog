import fs from "fs/promises";
import { existsSync } from "fs";

import { createTest } from "../../utils";

createTest(__dirname, {
  testLocalRun: true,
  testInstallRun: true,
  testCachedRun: true,
  result(ctx) {
    expect(existsSync(ctx.relativePath("test.txt"))).toBe(true);
  },
  async undo(ctx) {
    await fs.rm(ctx.relativePath("test.txt"));
  },
});
