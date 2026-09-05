import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");

test("mobile hero image describes only what the unverified asset visibly supports", () => {
  assert.match(homepage, /alt="A baker arranging freshly baked rolls at a sunlit bakery counter"/);
  assert.match(homepage, /width=\{1672\}/);
  assert.match(homepage, /height=\{941\}/);
  assert.match(homepage, /loading="eager"/);
  assert.match(homepage, /sizes="\(max-width: 67\.25rem\) 100vw, 0px"/);
  assert.doesNotMatch(homepage, /buddas-about-storefront\.png[\s\S]{0,300}priority/);
  assert.match(homepage, /className="h-72 w-full object-cover object-\[78%_52%\] sm:object-\[75%_50%\]"/);
  assert.doesNotMatch(homepage, /alt="Bakery team member arranging Budda Rolls at a storefront window"/);
});
