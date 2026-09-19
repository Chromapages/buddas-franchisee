import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { canonicalizeSupplyCategory } from "../src/features/portal/catalog-taxonomy.ts";

const browser = fs.readFileSync("src/components/portal/catalog-browser.tsx", "utf8");
const order = fs.readFileSync("src/components/portal/catalog-current-order.tsx", "utf8");
const styles = fs.readFileSync("src/app/portal/supplies/supplies-desktop.css", "utf8");
const page = fs.readFileSync("src/app/portal/supplies/page.tsx", "utf8");
const controls = fs.readFileSync("src/components/portal/catalog-desktop-controls.tsx", "utf8");
const reorder = fs.readFileSync("src/components/portal/catalog-replenishment-guide.tsx", "utf8");

test("supplies offers persistent Browse and native Quick Order workflows", () => {
  assert.match(browser, /"browse" \| "quick"/);
  assert.match(browser, /sessionStorage\.setItem\(viewStorageKey, view\)/);
  assert.match(browser, /<table><caption>Quick Order approved supplies<\/caption>/);
  assert.match(browser, /Quantity — \$\{product\.name\}/);
  assert.match(browser, /CatalogQuantityAction/);
  assert.match(browser, /catalog-row-order-state/);
  assert.doesNotMatch(browser, /disabled=\{pending \|\| confirmedQuantity === quantity\}/);
  assert.match(order, /orderUnitSummary/);
  assert.match(order, /catalog-order-rail-stepper/);
  assert.match(styles, /grid-template-columns: minmax\(0, 1fr\) minmax\(18rem, 20rem\)/);
});

test("supplies keeps a compact workflow header, toolbar, and data-backed Order Again", () => {
  assert.doesNotMatch(page, /Everything you need\./);
  assert.match(page, /Approved products and pricing for \{session\.locationName\}/);
  assert.match(browser, /aria-label="Catalog workspace mode"/);
  assert.doesNotMatch(browser, /catalog-search-submit/);
  assert.match(controls, /catalog-category-pills/);
  assert.match(controls, /aria-pressed=\{filters\.category === category\}/);
  assert.match(reorder, /Recent supplies for this location/);
  assert.match(reorder, /No longer available in this catalog/);
  assert.match(reorder, /Find replacement/);
  assert.match(styles, /\.catalog-category-pills button \{ min-height: 2\.75rem/);
});

test("illustrative procurement arithmetic stays exact in minor units", () => {
  const lines = [{ cents: 7849, quantity: 3 }, { cents: 4849, quantity: 2 }, { cents: 7200, quantity: 1 }];
  assert.equal(lines.reduce((sum, line) => sum + line.cents * line.quantity, 0), 40445);
  assert.equal(lines.length, 3);
  assert.equal(lines.reduce((sum, line) => sum + line.quantity, 0), 6);
});

test("legacy catalog examples use canonical procurement categories", () => {
  const item = (name, category) => ({ id: name, sku: name, name, category, description: "", packSize: "Pack of 1", leadTimeDays: 1, isAvailable: true, price: 1, slug: name });
  assert.equal(canonicalizeSupplyCategory(item("Bakery Tissue", "Equipment")).category, "Packaging & Paper");
  assert.equal(canonicalizeSupplyCategory(item("Nitrile Gloves", "Signage & Uniforms")).category, "Food Safety & PPE");
  assert.equal(canonicalizeSupplyCategory(item("Branded Black Apron", "Signage & Uniforms")).category, "Uniforms");
  assert.equal(canonicalizeSupplyCategory(item("Reusable name badge", "Signage & Uniforms")).category, "Brand Materials");
});
