import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const homepage = fs.readFileSync(path.resolve("src/app/franchise/page.tsx"), "utf8");
const navbar = fs.readFileSync(path.resolve("src/components/public/navbar.tsx"), "utf8");
const styles = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");

test("mobile hero spacing follows named 8px-scale tokens", () => {
  for (const token of [
    "--space-4",
    "--space-6",
  ]) assert.ok(styles.includes(token));

  assert.match(homepage, /franchise-home-hero relative pt-0 pb-0/);
  assert.match(homepage, /franchise-home-hero-mobile-image hero:hidden relative mt-2 h-72/);
  assert.match(homepage, /franchise-hero-actions flex w-full max-w-none flex-col items-stretch gap-4 pt-0/);
  assert.match(homepage, /btn-primary min-h-\[52px\] w-full/);
  assert.doesNotMatch(homepage, /franchise-hero-actions[^"\n]*max-w-\[320px\]/);
});

test("mobile header keeps 16px gutters and a 64px bar", () => {
  assert.match(styles, /--page-gutter: 1rem/);
  assert.match(navbar, /public-navbar-bar relative flex items-center justify-between h-16 nav:h-20/);
});
