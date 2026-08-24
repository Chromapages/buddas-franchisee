import assert from "node:assert/strict";
import test from "node:test";

import {
  primaryNavItems,
  utilityNavItems,
  publicNavItems,
} from "../src/features/navigation/nav-config.ts";

test("primaryNavItems contains exactly 4 Mode-A safe educational links in approved sequence", () => {
  assert.equal(primaryNavItems.length, 4);

  assert.deepEqual(
    primaryNavItems.map((item) => item.label),
    ["Why Budda's", "The Opportunity", "How It Works", "FAQ"]
  );

  assert.deepEqual(
    primaryNavItems.map((item) => item.href),
    [
      "/franchise/why-buddas",
      "/franchise/the-opportunity",
      "/franchise/process",
      "/franchise/faq",
    ]
  );
});

test("primaryNavItems avoids unapproved financial disclosures in Mode-A launch status", () => {
  for (const item of primaryNavItems) {
    assert.ok(
      !item.label.toLowerCase().includes("financial"),
      `Label "${item.label}" should not contain financial language in Mode A`
    );
    assert.ok(
      !item.label.toLowerCase().includes("item 19"),
      `Label "${item.label}" should not mention Item 19 in nav header`
    );
  }
});

test("utilityNavItems includes consumer restaurant site and operator login with proper attributes", () => {
  assert.equal(utilityNavItems.length, 2);

  const restaurantItem = utilityNavItems.find((item) =>
    item.label.toLowerCase().includes("restaurant") ||
    item.label.toLowerCase().includes("menu")
  );
  assert.ok(restaurantItem, "Expected a restaurant/menu utility link");
  assert.equal(restaurantItem.external, true);
  assert.ok(restaurantItem.href.startsWith("http"));

  const loginItem = utilityNavItems.find((item) =>
    item.label.toLowerCase().includes("login")
  );
  assert.ok(loginItem, "Expected an operator login utility link");
  assert.equal(loginItem.href, "/franchise/login");
  assert.equal(loginItem.external, false);
});

test("publicNavItems alias maintains backwards compatibility with primaryNavItems", () => {
  assert.deepEqual(publicNavItems, primaryNavItems);
});
