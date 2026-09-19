import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  consumeConfirmedOperatorLocationSwitch,
  markOperatorLocationSwitch,
  trackOperatorWorkspaceEvent,
} from "../src/lib/analytics.ts";

const withBrowserAnalytics = (run) => {
  const originalWindow = globalThis.window;
  const originalCustomEvent = globalThis.CustomEvent;
  const values = new Map();
  const dataLayer = [];
  globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
  globalThis.window = {
    dataLayer,
    dispatchEvent: () => true,
    sessionStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  };
  try { return run(dataLayer); } finally {
    globalThis.window = originalWindow;
    globalThis.CustomEvent = originalCustomEvent;
  }
};

test("operator analytics emits only bounded, allow-listed context", () => withBrowserAnalytics((dataLayer) => {
  trackOperatorWorkspaceEvent("operator_dashboard_viewed", {
    role_category: "admin",
    location_scope_count: 2,
    attention_count: 999,
    active_work_count: 3,
    route: "/portal",
    email: "operator@example.com",
    unit_id: "HNL-014",
    invoice_id: "INV-private",
  });
  assert.deepEqual(dataLayer[0], {
    event: "operator_dashboard_viewed",
    workspace: "operator",
    role_category: "admin",
    location_scope_count: 2,
    attention_count: 100,
    active_work_count: 3,
    route: "/portal",
  });

  trackOperatorWorkspaceEvent("operator_active_work_opened", {
    active_work_count: 1,
    route: "/portal/orders",
    order_contents: ["private"],
    invoice_id: "INV-private",
  });
  assert.deepEqual(dataLayer[1], {
    event: "operator_active_work_opened",
    workspace: "operator",
    active_work_count: 1,
    route: "/portal/orders",
  });

  trackOperatorWorkspaceEvent("operator_dashboard_fetch_failed", {
    route: "/portal/orders/ORDER-PRIVATE",
    error_category: "database_secret",
  });
  assert.deepEqual(dataLayer[2], {
    event: "operator_dashboard_fetch_failed",
    workspace: "operator",
  });
}));

test("location-switch analytics fires only after the selected authorized scope becomes active", () => withBrowserAnalytics(() => {
  markOperatorLocationSwitch("HNL-014");
  assert.equal(consumeConfirmedOperatorLocationSwitch("OAH-207"), false);
  markOperatorLocationSwitch("HNL-014");
  assert.equal(consumeConfirmedOperatorLocationSwitch("HNL-014"), true);
  assert.equal(consumeConfirmedOperatorLocationSwitch("HNL-014"), false);
}));

test("supplies analytics keeps useful procurement context and drops unsafe payload fields", () => withBrowserAnalytics((dataLayer) => {
  trackOperatorWorkspaceEvent("operator_supply_added", {
    category: "Packaging",
    sku: "PKG-RB12",
    quantity: 3,
    result_count: 420,
    filter_count: 2,
    sort: "recently_ordered",
    location_scope: "active_unit",
    availability_state: "AVAILABLE",
    lead_time_bucket: "4_plus_days",
    cart_item_count: 3,
    product_count: 2,
    cart_action: "add",
    time_to_first_product_added_ms: 3210,
    purchase_path: "repeat",
    route: "/portal/supplies",
    search_query: "operator typed private text",
    email: "private@example.com",
    token: "secret",
    price: 84,
  });
  assert.deepEqual(dataLayer[0], {
    event: "operator_supply_added",
    workspace: "operator",
    route: "/portal/supplies",
    category: "Packaging",
    sku: "PKG-RB12",
    result_count: 420,
    filter_count: 2,
    sort: "recently_ordered",
    location_scope: "active_unit",
    quantity: 3,
    availability_state: "AVAILABLE",
    lead_time_bucket: "4_plus_days",
    cart_item_count: 3,
    product_count: 2,
    cart_action: "add",
    time_to_first_product_added_ms: 3210,
    purchase_path: "repeat",
  });
}));

test("dashboard instrumentation covers the decision-grade event set", () => {
  const sources = [
    "src/components/portal/operator-analytics.tsx",
    "src/components/portal/operator-status.tsx",
    "src/components/portal/dashboard-modules.tsx",
    "src/components/portal/dashboard-quick-actions-client.tsx",
    "src/components/portal/dashboard-freshness.tsx",
    "src/components/portal/portal-shell.tsx",
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  for (const event of [
    "operator_dashboard_viewed",
    "operator_attention_items_presented",
    "operator_attention_item_opened",
    "operator_active_work_opened",
    "operator_quick_action_selected",
    "operator_location_switched",
    "operator_order_opened",
    "operator_orders_view_all",
    "operator_support_opened",
    "operator_resource_center_opened",
    "operator_bulletin_opened",
    "operator_dashboard_refreshed",
    "operator_dashboard_fetch_failed",
    "operator_bottom_nav_selected",
  ]) assert.match(sources, new RegExp(`\\b${event}\\b`), `${event} must be wired`);
});

test("supplies instrumentation covers the implemented purchase workflow", () => {
  const sources = [
    "src/components/portal/catalog-browser.tsx",
    "src/components/portal/catalog-current-order.tsx",
    "src/components/portal/supply-purchase-control.tsx",
    "src/components/portal/checkout-form.tsx",
    "src/components/portal/operator-analytics.tsx",
    "src/app/portal/cart/page.tsx",
    "src/app/portal/checkout/confirmation/page.tsx",
  ].map((path) => readFileSync(path, "utf8")).join("\n");
  for (const event of [
    "operator_supplies_viewed",
    "operator_supply_search_submitted",
    "operator_supply_search_no_results",
    "operator_supply_category_selected",
    "operator_supply_filter_applied",
    "operator_supply_filter_removed",
    "operator_supply_sort_changed",
    "operator_supply_product_opened",
    "operator_supply_added",
    "operator_supply_quantity_changed",
    "operator_supply_removed",
    "operator_supply_cart_update_failed",
    "operator_supply_current_order_opened",
    "operator_supply_cart_opened",
    "operator_supply_checkout_started",
    "operator_supply_order_submitted",
    "operator_supply_order_failed",
  ]) assert.match(sources, new RegExp(`\\b${event}\\b`), `${event} must be wired`);
});
