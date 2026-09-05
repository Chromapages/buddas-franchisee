import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const readSource = (file) => fs.readFileSync(path.resolve(file), "utf8");
const homepage = readSource("src/app/franchise/page.tsx");
const navbar = readSource("src/components/public/navbar.tsx");
const styles = readSource("src/app/globals.css");

test("mobile hero preserves accessible structure and meaningful image text", () => {
  assert.match(homepage, /Franchise Opportunity/);
  assert.match(homepage, /aria-hidden="true"/);
  assert.match(homepage, /<h1[^>]*>[\s\S]*?Build Budda&apos;s[\s\S]*?in Your Market/);
  assert.match(homepage, /alt="A baker arranging freshly baked rolls at a sunlit bakery counter"/);
});

test("mobile hero and header controls expose a 44px target and visible focus ring", () => {
  assert.match(styles, /min-inline-size: 2\.75rem/);
  assert.match(styles, /min-block-size: 2\.75rem/);
  assert.match(homepage, /touch-target btn-primary[\s\S]*?focus-visible:ring-4/);
  assert.match(homepage, /touch-target inline-flex min-h-\[48px\] w-full[\s\S]*?focus-visible:ring-4/);
  assert.match(navbar, /public-navbar-mobile-cta touch-target[\s\S]*?focus-visible:ring-4/);
  assert.match(navbar, /touch-target shrink-0 rounded-xl border border-bds-teal-dark\/15 bg-bds-cream p-2\.5[\s\S]*?focus-visible:ring-4/);
});
