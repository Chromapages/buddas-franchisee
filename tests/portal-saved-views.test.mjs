import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  areOrderCriteriaEqual,
  areSupportCriteriaEqual,
  deleteCustomView,
  loadCustomViews,
  saveCustomView,
  SYSTEM_ORDER_VIEWS,
  SYSTEM_SUPPORT_VIEWS,
  type OrderViewCriteria,
  type SavedOrderView,
  type SavedSupportView,
  type SupportViewCriteria,
} from "../src/features/portal/saved-views.ts";

test("SYSTEM_ORDER_VIEWS: has standard immutable presets", () => {
  assert.equal(SYSTEM_ORDER_VIEWS.length, 3);

  const [allOrders, inMotion, needsAttention] = SYSTEM_ORDER_VIEWS;

  assert.equal(allOrders.id, "sys-orders-all");
  assert.equal(allOrders.name, "All orders");
  assert.equal(allOrders.isSystem, true);
  assert.equal(allOrders.criteria.view, "all");
  assert.equal(allOrders.criteria.statusFilter, "ALL");
  assert.equal(allOrders.criteria.query, "");

  assert.equal(inMotion.id, "sys-orders-in-motion");
  assert.equal(inMotion.name, "In motion");
  assert.equal(inMotion.isSystem, true);
  assert.equal(inMotion.criteria.view, "in-motion");

  assert.equal(needsAttention.id, "sys-orders-attention");
  assert.equal(needsAttention.name, "Needs attention");
  assert.equal(needsAttention.isSystem, true);
  assert.equal(needsAttention.criteria.view, "needs-attention");
});

test("SYSTEM_SUPPORT_VIEWS: has standard immutable presets", () => {
  assert.equal(SYSTEM_SUPPORT_VIEWS.length, 4);

  const [allTickets, needsAttention, openReview, resolved] = SYSTEM_SUPPORT_VIEWS;

  assert.equal(allTickets.id, "sys-support-all");
  assert.equal(allTickets.name, "All tickets");
  assert.equal(allTickets.isSystem, true);
  assert.equal(allTickets.criteria.filter, "all");
  assert.equal(allTickets.criteria.query, "");

  assert.equal(needsAttention.id, "sys-support-attention");
  assert.equal(needsAttention.name, "Needs attention");
  assert.equal(needsAttention.isSystem, true);
  assert.equal(needsAttention.criteria.filter, "needs-attention");

  assert.equal(openReview.id, "sys-support-open");
  assert.equal(openReview.name, "Open & in review");
  assert.equal(openReview.isSystem, true);
  assert.equal(openReview.criteria.filter, "open");

  assert.equal(resolved.id, "sys-support-resolved");
  assert.equal(resolved.name, "Resolved");
  assert.equal(resolved.isSystem, true);
  assert.equal(resolved.criteria.filter, "resolved");
});

test("areOrderCriteriaEqual: accurately compares criteria ignoring whitespace and casing", () => {
  const base: OrderViewCriteria = {
    query: "Packaging",
    statusFilter: "PROCESSING",
    view: "in-motion",
    sort: "newest",
  };

  const matching: OrderViewCriteria = {
    query: "  packaging  ",
    statusFilter: "PROCESSING",
    view: "in-motion",
    sort: "newest",
  };

  const differentQuery: OrderViewCriteria = {
    ...base,
    query: "Ingredient",
  };

  const differentStatus: OrderViewCriteria = {
    ...base,
    statusFilter: "DELIVERED",
  };

  const differentView: OrderViewCriteria = {
    ...base,
    view: "all",
  };

  const differentSort: OrderViewCriteria = {
    ...base,
    sort: "highest-total",
  };

  assert.equal(areOrderCriteriaEqual(base, matching), true);
  assert.equal(areOrderCriteriaEqual(base, differentQuery), false);
  assert.equal(areOrderCriteriaEqual(base, differentStatus), false);
  assert.equal(areOrderCriteriaEqual(base, differentView), false);
  assert.equal(areOrderCriteriaEqual(base, differentSort), false);
});

test("areSupportCriteriaEqual: accurately compares criteria ignoring whitespace and casing", () => {
  const base: SupportViewCriteria = {
    query: "Oven Issue",
    filter: "needs-attention",
  };

  const matching: SupportViewCriteria = {
    query: "  oven issue  ",
    filter: "needs-attention",
  };

  const differentQuery: SupportViewCriteria = {
    ...base,
    query: "POS issue",
  };

  const differentFilter: SupportViewCriteria = {
    ...base,
    filter: "resolved",
  };

  assert.equal(areSupportCriteriaEqual(base, matching), true);
  assert.equal(areSupportCriteriaEqual(base, differentQuery), false);
  assert.equal(areSupportCriteriaEqual(base, differentFilter), false);
});

test("saved-views storage helpers: save, load, and delete custom views with mock window.localStorage", () => {
  const storageMap = new Map<string, string>();

  // Mock global window and localStorage for node test runner
  const mockLocalStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, val: string) => storageMap.set(key, val),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear(),
  };

  // @ts-expect-error test mock
  globalThis.window = { localStorage: mockLocalStorage };

  const unitId = "HNL-014";

  // Initially empty
  const initial = loadCustomViews<SavedOrderView>("orders", unitId);
  assert.deepEqual(initial, []);

  // Save new custom view
  const customView: SavedOrderView = {
    id: "ord-custom-1",
    name: "Urgent Dough Supplies",
    isSystem: false,
    criteria: {
      query: "Dough",
      statusFilter: "SUBMITTED",
      view: "needs-attention",
      sort: "highest-total",
    },
  };

  const afterSave = saveCustomView<SavedOrderView>("orders", unitId, customView);
  assert.equal(afterSave.length, 1);
  assert.equal(afterSave[0].name, "Urgent Dough Supplies");

  // Load back from storage
  const reloaded = loadCustomViews<SavedOrderView>("orders", unitId);
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].id, "ord-custom-1");

  // Save second view
  const customView2: SavedOrderView = {
    id: "ord-custom-2",
    name: "Delivered Packaging",
    isSystem: false,
    criteria: {
      query: "Box",
      statusFilter: "DELIVERED",
      view: "all",
      sort: "newest",
    },
  };
  saveCustomView<SavedOrderView>("orders", unitId, customView2);

  const afterSave2 = loadCustomViews<SavedOrderView>("orders", unitId);
  assert.equal(afterSave2.length, 2);

  // Delete first view
  const afterDelete = deleteCustomView<SavedOrderView>("orders", unitId, "ord-custom-1");
  assert.equal(afterDelete.length, 1);
  assert.equal(afterDelete[0].id, "ord-custom-2");

  // Clean up global mock
  // @ts-expect-error cleanup mock
  delete globalThis.window;
});

test("dashboard isolation: verifies zero configurable saved-view machinery on the Main Dashboard", () => {
  const dashboardPagePath = path.resolve(
    process.cwd(),
    "src/app/portal/page.tsx",
  );
  const dashboardModulesPath = path.resolve(
    process.cwd(),
    "src/components/portal/dashboard-modules.tsx",
  );

  const dashboardPageContent = fs.readFileSync(dashboardPagePath, "utf-8");
  const dashboardModulesContent = fs.readFileSync(dashboardModulesPath, "utf-8");

  // Verify neither file imports saved-views
  assert.equal(
    dashboardPageContent.includes("saved-views"),
    false,
    "Dashboard page must NOT import saved-views machinery",
  );
  assert.equal(
    dashboardModulesContent.includes("saved-views"),
    false,
    "Dashboard modules must NOT import saved-views machinery",
  );

  // Verify no configurable view controls in dashboard page
  assert.equal(
    dashboardPageContent.includes("Save view"),
    false,
    "Dashboard page must not expose custom view saving machinery",
  );
  assert.equal(
    dashboardModulesContent.includes("Save view"),
    false,
    "Dashboard modules must not expose custom view saving machinery",
  );
});
