import fs from "fs";

import { createTest } from "../../utils";

createTest(__dirname, (ctx) => {
  ctx.build();
  const uncache = ctx.uncache("create-file");

  async function runTest() {
    await uncache;
    await ctx.run(".");
    expect(fs.existsSync(ctx.relativePath("test.txt"))).toBe(true);
    fs.rmSync(ctx.relativePath("test.txt")); // TODO: once you write diffing functionality, just use that to revert changes instead
  }

  it("runs properly when not installed", runTest);
  it("runs properly if already cached", runTest);
});
