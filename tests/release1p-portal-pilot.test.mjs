import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInsertOrderQuery,
  buildInsertOrderItemQuery,
  buildInsertSupportCaseQuery,
  buildSelectBulletinsQuery,
  buildSelectLocationByIdQuery,
  buildSelectLocationsQuery,
  buildSelectOrdersByLocationQuery,
  buildSelectProductsByLocationQuery,
  buildSelectResourcesByLocationQuery,
  buildSelectSupportCasesByLocationQuery,
} from "../src/features/portal/db-storage.ts";
import {
  defaultPortalStorage,
  InMemoryPortalStorage,
} from "../src/features/portal/storage-adapter.ts";
import {
  canAccessLocation,
  formatSessionLocation,
  hasRoleAccess,
} from "../src/lib/auth/auth-provider.ts";
import {
  assertPortalPermission,
  PortalAuthorizationError,
} from "../src/features/portal/authorization.ts";
import {
  mapSupabaseUserToPortalSession,
} from "../src/lib/auth/supabase.ts";
import {
  canTransitionOrderStatus,
  getOrderStatus,
  getOrderStatusAccessibleLabel,
  getOrderStatusAnalytics,
  getOrderStatusNotification,
  normalizeOrderStatus,
  ORDER_STATUS,
  requiresOrderOperatorAction,
} from "../src/features/portal/order-status.ts";
import {
  getVisibleBulletins,
  requiresBulletinAction,
} from "../src/features/portal/bulletins.ts";

test("buildSelectLocationsQuery generates correct SQL for active locations", () => {
  const query = buildSelectLocationsQuery();
  assert.ok(query.text.includes("SELECT location_id as \"id\""));
  assert.ok(query.text.includes("FROM portal_locations"));
  assert.deepEqual(query.values, []);
});

test("buildSelectLocationByIdQuery generates parameterized location lookup", () => {
  const query = buildSelectLocationByIdQuery("HNL-014");
  assert.ok(query.text.includes("WHERE location_id = $1"));
  assert.deepEqual(query.values, ["HNL-014"]);
});

test("buildSelectProductsByLocationQuery filters catalog pricing by locationId", () => {
  const query = buildSelectProductsByLocationQuery("HNL-014");
  assert.ok(query.text.includes("JOIN portal_product_prices pp"));
  assert.ok(query.text.includes("WHERE pp.location_id = $1"));
  assert.deepEqual(query.values, ["HNL-014"]);
});

test("buildSelectOrdersByLocationQuery joins order items and scopes by tenant", () => {
  const query = buildSelectOrdersByLocationQuery("OAH-207");
  assert.ok(query.text.includes("FROM portal_orders o"));
  assert.ok(query.text.includes("WHERE o.location_id = $1"));
  assert.deepEqual(query.values, ["OAH-207"]);
});

test("bulletin query and visibility model retain only supported operational communication", () => {
  const query = buildSelectBulletinsQuery({ managedLocationIds: ["HNL-014"], role: "franchisee" });
  assert.ok(query.text.includes('body as "summary"'));
  assert.ok(query.text.includes('is_urgent'));
  assert.ok(query.text.includes('audience_unit_ids'));
  assert.deepEqual(query.values, [["HNL-014"], "franchisee"]);

  const bulletins = [
    { id: "current", title: "Current", summary: "Current bulletin", publishedAt: "2026-08-15T00:00:00Z" },
    { id: "expired", title: "Expired", summary: "Expired bulletin", publishedAt: "2026-08-16T00:00:00Z", expiresAt: "2026-08-20T00:00:00Z" },
    { id: "action", title: "Action", summary: "Action bulletin", publishedAt: "2026-08-17T00:00:00Z", priority: "ACTION_REQUIRED" },
  ];

  assert.deepEqual(getVisibleBulletins(bulletins, "HNL-014", "franchisee", new Date("2026-08-21T00:00:00Z")).map((bulletin) => bulletin.id), ["action", "current"]);
  assert.equal(requiresBulletinAction(bulletins[2]), true);
  assert.equal(requiresBulletinAction({ id: "ack-only", title: "Ack", summary: "No persisted workflow", publishedAt: "2026-08-18T00:00:00Z", acknowledgement: { required: true } }), false);
});

test("buildInsertOrderQuery & buildInsertOrderItemQuery create valid parameterized statements", () => {
  const orderInput = {
    id: "BD-1099",
    locationId: "HNL-014",
    createdAt: "2026-08-21T00:00:00.000Z",
    status: ORDER_STATUS.PROCESSING.id,
    eta: "Next Wednesday",
    total: 154.5,
    invoiceId: "INV-99001",
    items: [
      { sku: "PKG-RB12", name: "Roll box, 12-count", quantity: 2, price: 24.5 },
    ],
  };

  const orderQuery = buildInsertOrderQuery(orderInput);
  assert.ok(orderQuery.text.includes("INSERT INTO portal_orders"));
  assert.equal(orderQuery.values[0], "BD-1099");
  assert.equal(orderQuery.values[1], "HNL-014");
  assert.equal(orderQuery.values[4], "Next Wednesday");
  assert.equal(orderQuery.values[5], 154.5);

  const itemQuery = buildInsertOrderItemQuery("BD-1099", orderInput.items[0]);
  assert.ok(itemQuery.text.includes("INSERT INTO portal_order_items"));
  assert.equal(itemQuery.values[0], "BD-1099");
  assert.equal(itemQuery.values[1], "PKG-RB12");
  assert.equal(itemQuery.values[3], 2);
});

test("buildInsertSupportCaseQuery captures support intake with user email and location", () => {
  const ticketInput = {
    id: "SUP-123456",
    locationId: "HNL-014",
    userEmail: "operator@buddasdemo.com",
    subject: "Packaging box reorder delay",
    topic: "Supply ordering and replacements",
    details: "Need 4 additional roll boxes before the weekend rush.",
  };

  const query = buildInsertSupportCaseQuery(ticketInput);
  assert.ok(query.text.includes("INSERT INTO portal_support_cases"));
  assert.equal(query.values[0], "SUP-123456");
  assert.equal(query.values[1], "HNL-014");
  assert.equal(query.values[2], "operator@buddasdemo.com");
  assert.equal(query.values[3], "Packaging box reorder delay");
});

test("support-case retrieval is scoped to the active unit", () => {
  const query = buildSelectSupportCasesByLocationQuery("HNL-014");
  assert.ok(query.text.includes("FROM portal_support_cases"));
  assert.ok(query.text.includes("WHERE location_id = $1"));
  assert.deepEqual(query.values, ["HNL-014"]);
});

test("InMemoryPortalStorage provides reliable seeded data and mutation handling", async () => {
  const storage = new InMemoryPortalStorage();
  const locations = await storage.getLocations();
  assert.ok(locations.length >= 3);

  const order = {
    id: "BD-TEST-001",
    locationId: "HNL-014",
    createdAt: new Date().toISOString(),
    status: ORDER_STATUS.PROCESSING.id,
    eta: "In 2 days",
    total: 99.0,
    invoiceId: "INV-TEST-01",
    items: [{ sku: "PKG-RB12", name: "Box", quantity: 1, price: 99.0 }],
  };

  await storage.createOrder(order);
  const locationOrders = await storage.getOrdersByLocation("HNL-014");
  assert.ok(locationOrders.some((o) => o.id === "BD-TEST-001"));
});

test("order status model owns lifecycle, accessibility, notifications, and analytics semantics", () => {
  const delayed = getOrderStatus(ORDER_STATUS.DELAYED.id);

  assert.equal(delayed.label, "Delayed");
  assert.equal(delayed.operatorActionRequired, true);
  assert.equal(requiresOrderOperatorAction(ORDER_STATUS.CANCELLED.id), true);
  assert.equal(canTransitionOrderStatus(ORDER_STATUS.PROCESSING.id, ORDER_STATUS.IN_TRANSIT.id), true);
  assert.equal(canTransitionOrderStatus(ORDER_STATUS.DELIVERED.id, ORDER_STATUS.PROCESSING.id), false);
  assert.equal(normalizeOrderStatus("Shipped"), ORDER_STATUS.IN_TRANSIT.id);
  assert.match(getOrderStatusAccessibleLabel(ORDER_STATUS.DELAYED.id), /requires operator review/i);
  assert.equal(getOrderStatusNotification(ORDER_STATUS.CANCELLED.id).actionLabel, "Review order");
  assert.equal(getOrderStatusAnalytics(ORDER_STATUS.DELIVERED.id).lifecycleStage, "complete");
});

test("RBAC auth-provider utilities strictly enforce role and location boundaries", () => {
  const franchiseeSession = {
    userId: "u1",
    email: "op@demo.com",
    role: "franchisee",
    locationId: "HNL-014",
    locationName: "La'ie Origin Grill",
    managedLocationIds: ["HNL-014"],
    expiresAt: Date.now() + 10000,
  };

  const adminSession = {
    userId: "u2",
    email: "admin@demo.com",
    role: "admin",
    locationId: "HNL-014",
    locationName: "La'ie Origin Grill",
    managedLocationIds: ["HNL-014", "OAH-207", "SLC-302"],
    expiresAt: Date.now() + 10000,
  };

  assert.equal(canAccessLocation(franchiseeSession, "HNL-014"), true);
  assert.equal(canAccessLocation(franchiseeSession, "OAH-207"), false);
  assert.equal(canAccessLocation(adminSession, "OAH-207"), true);
  assert.equal(hasRoleAccess("franchisee", "admin"), false);
  assert.equal(hasRoleAccess("admin", "franchisee"), true);
});

test("authorization denies horizontal and vertical portal privilege escalation", () => {
  const operator = {
    userId: "operator-1",
    email: "operator@example.test",
    role: "franchisee",
    locationId: "HNL-014",
    locationName: "La'ie Origin Grill",
    managedLocationIds: ["HNL-014"],
    expiresAt: Date.now() + 10_000,
  };
  const scopedAdmin = {
    ...operator,
    userId: "admin-1",
    role: "admin",
    managedLocationIds: ["HNL-014"],
  };

  assert.doesNotThrow(() => assertPortalPermission(operator, "VIEW_ORDERS"));
  assert.throws(() => assertPortalPermission(operator, "VIEW_ORDERS", "OAH-207"), PortalAuthorizationError);
  assert.throws(() => assertPortalPermission(operator, "ADMINISTER_PORTAL"), PortalAuthorizationError);
  assert.doesNotThrow(() => assertPortalPermission(scopedAdmin, "ADMINISTER_PORTAL"));
  assert.throws(() => assertPortalPermission(scopedAdmin, "VIEW_RESOURCES", "SLC-302"), PortalAuthorizationError);
});

test("Supabase portal authorization uses app metadata rather than mutable user metadata", () => {
  const session = mapSupabaseUserToPortalSession({
    id: "supabase-user",
    email: "operator@example.test",
    user_metadata: { role: "admin", locationId: "SLC-302", managedLocationIds: ["SLC-302"] },
    app_metadata: { portal_access: true, role: "franchisee", location_id: "HNL-014", location_name: "La'ie Origin Grill", managed_location_ids: ["HNL-014"] },
  });

  assert.equal(session.role, "franchisee");
  assert.equal(session.locationId, "HNL-014");
  assert.deepEqual(session.managedLocationIds, ["HNL-014"]);
  assert.throws(() => mapSupabaseUserToPortalSession({ id: "unassigned", email: "unassigned@example.test", app_metadata: { role: "admin" } }));
});
