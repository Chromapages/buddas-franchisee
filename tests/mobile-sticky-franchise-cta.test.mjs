import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const readSource = (file) => fs.readFileSync(path.resolve(file), "utf8");
const component = readSource("src/components/public/mobile-sticky-franchise-cta.tsx");
const homepage = readSource("src/app/franchise/page.tsx");
const styles = readSource("src/app/globals.css");

test("mobile sticky CTA observes the hero, full-size CTA, and footer without scroll listeners", () => {
  assert.match(component, /new IntersectionObserver/);
  assert.match(component, /\[data-franchise-home-hero\]/);
  assert.match(component, /\[data-sticky-cta-hide\]/);
  assert.match(component, /document\.querySelector\("footer"\)/);
  assert.doesNotMatch(component, /addEventListener\("scroll"/);
  assert.match(homepage, /data-franchise-home-hero/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
});
