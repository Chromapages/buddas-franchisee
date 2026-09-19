import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const readSource = (file) => fs.readFileSync(path.resolve(file), "utf8");
const homepage = readSource("src/app/franchise/page.tsx");
const mobileHero = readSource("src/components/public/homepage-hero-mobile.tsx");
const heroMedia = readSource("src/components/public/homepage-hero-media.tsx");
const heroContent = readSource("src/features/franchise/home-hero-content.ts");
const navbar = readSource("src/components/public/navbar.tsx");
const styles = readSource("src/app/globals.css");

test("mobile hero preserves accessible structure and meaningful image text", () => {
  assert.match(heroContent, /Franchise Opportunity/);
  assert.match(mobileHero, /aria-hidden="true"/);
  assert.match(mobileHero, /<h1[^>]*>/);
  assert.match(heroContent, /Build the Next/);
  assert.match(heroContent, /Freshly baked Budda Rolls at a bakery counter/);
  assert.match(heroMedia, /alt=\{media\.imageAlt\}/);
});

test("mobile hero and header controls expose a 44px target and visible focus ring", () => {
  assert.match(styles, /min-inline-size: 2\.75rem/);
  assert.match(styles, /min-block-size: 2\.75rem/);
  assert.match(mobileHero, /touch-target flex min-h-14 w-full/);
  assert.match(mobileHero, /touch-target inline-flex min-h-11/);
  assert.match(styles, /\.homepage-mobile-hero-actions a:focus-visible[\s\S]*?outline: 3px solid/);
  assert.match(navbar, /public-navbar-mobile-cta touch-target[\s\S]*?focus-visible:ring-4/);
  assert.match(navbar, /touch-target shrink-0 rounded-xl border border-bds-teal-dark\/15 bg-bds-cream p-2\.5[\s\S]*?focus-visible:ring-4/);
});
