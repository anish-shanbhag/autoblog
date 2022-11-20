import { existsSync } from "fs";
import fs from "fs/promises";

import { createTest } from "../../utils";

createTest(__dirname, {
  testLocalRun: true,
  testInstallRun: true,
  testCachedRun: true,
  result(ctx) {
    expect(existsSync(ctx.relativePath("file.txt"))).toBe(false);
  },
  async undo(ctx) {
    await fs.writeFile(ctx.relativePath("file.txt"), "this is a file\n");
  },
});
