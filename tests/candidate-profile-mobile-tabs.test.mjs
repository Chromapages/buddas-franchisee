import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const mobile = fs.readFileSync("src/components/public/candidate-profile-mobile.tsx", "utf8");
const styles = fs.readFileSync("src/app/globals.css", "utf8");

test("mobile operator support is a static semantic register", () => {
  assert.doesNotMatch(mobile, /"use client"|useState|useEffect|aria-expanded/);
  assert.match(mobile, /<ul aria-label="Five systems behind operator support">/);
  assert.match(mobile, /operator-support-mobile/);
  assert.match(styles, /\.operator-support-mobile li/);
});
