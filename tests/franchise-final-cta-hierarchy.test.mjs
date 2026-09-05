import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const component = fs.readFileSync(path.resolve("src/components/public/franchise-final-cta.tsx"), "utf8");

test("global franchise CTA has one filled action and plain trust caption", () => {
  assert.ok((component.match(/btn-secondary/g) || []).length >= 1);
  assert.match(component, /Request a Mutual Evaluation/);
  assert.match(component, /aria-label="Franchise evaluation request"/);
  assert.match(component, /text-bds-cream/);
  assert.match(component, /Takes 2 minutes · Response in 48 hrs\./);
  assert.match(component, /See how we partner/);
  assert.match(component, /In-House Corporate Review/);
  assert.doesNotMatch(component, /WorkflowReassuranceCarousel/);
});
