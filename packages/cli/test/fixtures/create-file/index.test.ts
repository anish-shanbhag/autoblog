import fs from "fs";

import { createTest } from "../../utils";

createTest(__dirname, (ctx) => {
  ctx.build();
  const uncache = ctx.uncache("create-file");
  async function runTest(command: string) {
    await uncache;
    await ctx.runCommand(command);
    expect(fs.existsSync(ctx.relativePath("test.txt"))).toBe(true);
    fs.rmSync(ctx.relativePath("test.txt")); // TODO: once you write diffing functionality, just use that to revert changes instead
  }

  it("runs properly without an install", () => runTest("scaffold local run"));
  it("runs properly if installed", () =>
    runTest("scaffold local run --install"));
  it("runs properly when cached", () =>
    runTest("scaffold local run --install"));
});
