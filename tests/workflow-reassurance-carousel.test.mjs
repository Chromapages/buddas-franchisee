import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const component = fs.readFileSync(path.resolve("src/components/public/workflow-reassurance-carousel.tsx"), "utf8");

test("mobile reassurance carousel has manual arrows, swipe support, and live announcements", () => {
  assert.match(component, /In-House Corporate Review/);
  assert.match(component, /Digital Brochure After Inquiry/);
  assert.match(component, /Zero Obligation/);
  assert.match(component, /Previous reassurance highlight/);
  assert.match(component, /Next reassurance highlight/);
  assert.match(component, /onTouchStart=\{handleTouchStart\}/);
  assert.match(component, /aria-live="polite"/);
  assert.doesNotMatch(component, /setInterval/);
});
