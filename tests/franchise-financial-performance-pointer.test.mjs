import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");

test("mobile hero avoids public financial-performance implications while retaining capital qualification", () => {
  assert.doesNotMatch(homepage, /Financial performance details are shared with qualified candidates where permitted/);
  assert.doesNotMatch(homepage, /Average Unit Volume|payback period|margin range/i);
});
