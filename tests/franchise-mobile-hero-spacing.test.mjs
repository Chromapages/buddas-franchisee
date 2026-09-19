import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");
const mobileHero = fs.readFileSync(path.resolve("src/components/public/homepage-hero-mobile.tsx"), "utf8");
const navbar = fs.readFileSync(path.resolve("src/components/public/navbar.tsx"), "utf8");
const styles = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");

test("mobile hero spacing follows named 8px-scale tokens", () => {
  for (const token of [
    "--space-3",
    "--space-4",
    "--space-5",
  ]) assert.ok(styles.includes(token));

  assert.match(homepage, /className="homepage-hero-shell"/);
  assert.match(mobileHero, /className="homepage-mobile-hero hero:hidden bg-bds-cream"/);
  assert.match(styles, /\.homepage-mobile-hero-copy[\s\S]*?row-gap: var\(--space-4\)/);
  assert.match(styles, /\.homepage-mobile-hero-actions[\s\S]*?gap: var\(--space-3\)/);
  assert.match(mobileHero, /min-h-14 w-full/);
  assert.doesNotMatch(mobileHero, /max-w-\[320px\]/);
});

test("mobile header keeps 16px gutters and a 64px bar", () => {
  assert.match(styles, /--page-gutter: 1rem/);
  assert.match(navbar, /public-navbar-bar relative flex items-center justify-between h-16 nav:h-20/);
});
