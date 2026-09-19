import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { portalLocations, portalProducts } from "../src/features/portal/data.ts";

test("development catalog includes local mock records without production-only identifiers", () => {
  const mockProducts = portalProducts.filter((product) => product.id.startsWith("mock-"));
  assert.equal(mockProducts.length, 6);
  assert.ok(mockProducts.every((product) => product.sku.startsWith("DEV-")));
  assert.ok(mockProducts.every((product) => !product.imageUrl));
});

test("explicit local seed mode takes precedence only in development", () => {
  const storage = readFileSync("src/features/portal/storage-adapter.ts", "utf8");
  assert.match(storage, /PORTAL_USE_SEED_DATA === "true" && canUseDevelopmentSeedData\(\)/);
  assert.match(storage, /useDevelopmentSeedStorage\s*\? new InMemoryPortalStorage\(\)\s*:\s*hasDatabaseStorage/);
});

test("the Firebase demo operator's active unit exists in local seed storage", () => {
  assert.ok(portalLocations.some((location) => location.id === "SLC-001"));
});
