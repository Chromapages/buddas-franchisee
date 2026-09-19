import assert from "node:assert/strict";
import test from "node:test";
import { getCatalogControlVisibility } from "../src/components/portal/catalog-filtering.ts";

const product = (overrides = {}) => ({
  id: "product-1",
  sku: "SKU-1",
  name: "Cake box",
  category: "Packaging",
  description: "Approved packaging.",
  packSize: "Pack of 5",
  leadTimeDays: 2,
  isAvailable: true,
  price: 60,
  slug: "cake-box",
  ...overrides,
});

test("single-product catalog hides controls with no useful alternative", () => {
  assert.deepEqual(getCatalogControlVisibility({ products: [product()], recentlyOrderedSkus: ["SKU-1"] }), {
    search: false,
    category: false,
    availability: false,
    purchaseHistory: false,
    leadTime: false,
    sort: false,
    filter: false,
    refinementRail: false,
  });
});

test("catalog with meaningful facets exposes adaptive controls without a product-count rule", () => {
  const products = [
    product({ id: "one", sku: "ONE", name: "Bags", price: 36, category: "Packaging", leadTimeDays: 2, isAvailable: true }),
    product({ id: "two", sku: "TWO", name: "Dough mix", price: 70, category: "Bakery & Dough", leadTimeDays: 5, isAvailable: false }),
  ];

  assert.deepEqual(getCatalogControlVisibility({ products, recentlyOrderedSkus: ["ONE"] }), {
    search: false,
    category: true,
    availability: true,
    purchaseHistory: true,
    leadTime: true,
    sort: true,
    filter: true,
    refinementRail: true,
  });
});

test("one to three useful facets stay in the contextual strip instead of escalating to a rail", () => {
  const products = [
    product({ id: "one", sku: "ONE", name: "Z bags", price: 10, category: "Packaging", leadTimeDays: 2, isAvailable: true }),
    product({ id: "two", sku: "TWO", name: "A bags", price: 20, category: "Bakery & Dough", leadTimeDays: 2, isAvailable: false }),
  ];

  assert.deepEqual(getCatalogControlVisibility({ products, recentlyOrderedSkus: [] }), {
    search: false,
    category: true,
    availability: true,
    purchaseHistory: false,
    leadTime: false,
    sort: true,
    filter: true,
    refinementRail: false,
  });
});

test("catalog control visibility remains data-driven from zero through 200 products", () => {
  const expected = {
    category: true,
    availability: true,
    purchaseHistory: true,
    leadTime: true,
    sort: true,
    filter: true,
    refinementRail: true,
  };

  assert.deepEqual(getCatalogControlVisibility({ products: [], recentlyOrderedSkus: [] }), {
    search: false,
    category: false,
    availability: false,
    purchaseHistory: false,
    leadTime: false,
    sort: false,
    filter: false,
    refinementRail: false,
  });

  for (const count of [2, 3, 12, 50, 200]) {
    const products = Array.from({ length: count }, (_, index) => product({
      id: `product-${index}`,
      sku: `SKU-${index}`,
      name: `Approved supply ${String(index).padStart(3, "0")}`,
      category: index % 2 ? "Packaging" : "Bakery & Dough",
      leadTimeDays: index % 2 ? 5 : 2,
      isAvailable: index % 2 === 0,
      price: 20 + index,
      slug: `approved-supply-${index}`,
    }));
    assert.deepEqual(getCatalogControlVisibility({ products, recentlyOrderedSkus: [products[0].sku] }), { ...expected, search: count >= 8 }, `count ${count}`);
  }
});
