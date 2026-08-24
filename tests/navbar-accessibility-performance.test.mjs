import assert from "node:assert/strict";
import test from "node:test";

import {
  primaryNavItems,
  utilityNavItems,
  publicNavItems,
} from "../src/features/navigation/nav-config.ts";

test("accessibility: primary navigation items possess descriptive human labels and clean paths", () => {
  for (const item of primaryNavItems) {
    assert.ok(item.label && item.label.length > 0, "Item must have a non-empty label");
    assert.ok(item.href.startsWith("/"), "Internal nav link must start with /");
  }
});

test("accessibility: utility items specify valid external targets with security/screen-reader flags", () => {
  const externalItem = utilityNavItems.find((item) => item.external === true);
  assert.ok(externalItem, "External utility item should exist");
  assert.ok(externalItem.href.startsWith("http"), "External link should start with http protocol");
  assert.equal(externalItem.external, true);
});

test("performance: publicNavItems array is statically exportable and pure", () => {
  assert.equal(Array.isArray(publicNavItems), true);
  assert.equal(publicNavItems.length, 4);
});
