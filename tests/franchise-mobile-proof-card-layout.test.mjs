import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");
const styles = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");

test("proof rail keeps operating and capital fit visible without animation or horizontal scrolling", () => {
  assert.match(homepage, /divide-y divide-bds-teal-dark\/15 border-y border-bds-teal-dark\/15 sm:hidden/);
  assert.match(homepage, /Operating proof/);
  assert.match(homepage, /Capital readiness/);
  assert.doesNotMatch(homepage, /franchise-hero-proof-marquee|franchise-hero-proof-track/);
  assert.doesNotMatch(styles, /franchise-proof-flow/);
});

test("proof values use full-width rows rather than fixed-width metric cards", () => {
  assert.match(homepage, /flex min-h-12 flex-wrap items-center gap-3 py-2/);
  assert.match(homepage, /ml-auto min-w-0 max-w-full break-words text-right text-sm font-black/);
  assert.doesNotMatch(homepage, /grid-cols-2 gap-2 sm:hidden/);
});
