import fs from "fs";

import { createTest } from "../../utils";

createTest(__dirname, (ctx) => {
  ctx.build();
  const uncache = ctx.uncache("create-file");

  async function runTest(command: string) {
    await uncache;
    await ctx.command(command);
    expect(fs.existsSync(ctx.relativePath("test.txt"))).toBe(true);
    fs.rmSync(ctx.relativePath("test.txt")); // TODO: once you write diffing functionality, just use that to revert changes instead
  }

  it("runs properly without an install", () => runTest("local run"));
  it("runs properly if installed", () => runTest("local run --install"));
  it("runs properly when cached", () => runTest("local run --install"));
});
