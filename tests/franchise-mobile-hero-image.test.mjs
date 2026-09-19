import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");
const media = fs.readFileSync(path.resolve("src/components/public/homepage-hero-media.tsx"), "utf8");
const content = fs.readFileSync(path.resolve("src/features/franchise/home-hero-content.ts"), "utf8");
const styles = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");

test("mobile hero image describes only what the unverified asset visibly supports", () => {
  assert.match(homepage, /<HomepageHeroMedia \/>/);
  assert.match(content, /Freshly baked Budda Rolls at a bakery counter/);
  assert.match(media, /width=\{1672\}/);
  assert.match(media, /height=\{941\}/);
  assert.match(media, /loading="eager"/);
  assert.match(media, /fetchPriority="high"/);
  assert.match(media, /sizes="\(max-width: 67\.1875rem\) 100vw, 58vw"/);
  assert.match(styles, /\.homepage-hero-shared-media-image \{\s+object-position: 83% 52%/);
  assert.doesNotMatch(content, /alt: "Bakery team member arranging Budda Rolls at a storefront window"/);
});
