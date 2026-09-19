import assert from "node:assert/strict";
import test from "node:test";
import { assessSourceFreshness } from "../src/features/corporate/orders/freshness.ts";
import { buildOrderRecoveryActions } from "../src/features/corporate/orders/recovery.ts";
import {
  amendOrderLineQuantity,
  getLiveLineQuantity,
  getRemainingLineQuantity,
  recordOrderLineShipment,
  validateOrderLineInvariants,
} from "../src/features/corporate/orders/invariants.ts";
import {
  getOrderStatusSummary,
  requiresOrderRecovery,
  summarizeOrderFreshness,
} from "../src/features/corporate/orders/state.ts";

const referenceDate = new Date("2026-09-06T12:00:00Z");

const makeOrder = (overrides = {}) => ({
  id: "COR-ORD-9001",
  locationId: "HNL-014",
  locationName: "La'ie Origin Grill",
  supplierLabel: "Unconfigured supplier",
  createdAt: "2026-09-01T12:00:00Z",
  updatedAt: "2026-09-06T11:00:00Z",
  acceptanceState: "pending_review",
  fulfillmentState: "on_hold",
  paymentState: "failed",
  integrationState: "degraded",
  cancellationState: "requested",
  lines: [
    {
      sku: "PKG-RB12",
      name: "Branded 12-Pack Roll Takeout Boxes",
      orderedQuantity: 5,
      shippedQuantity: 3,
      amendedQuantity: 4,
      unitPrice: 84,
      shipmentReference: "SHIP-001",
    },
  ],
  sourceFreshness: [
    { source: "acceptance", observedAt: "2026-09-05T12:00:00Z", freshness: "fresh" },
    { source: "fulfillment", observedAt: "2026-07-10T12:00:00Z", freshness: "stale" },
    { source: "payment", observedAt: "2026-09-04T12:00:00Z", freshness: "fresh" },
    { source: "integration", observedAt: "2026-08-18T12:00:00Z", freshness: "recent" },
    { source: "cancellation", observedAt: undefined, freshness: "unknown" },
  ],
  recoveryActions: [],
  ...overrides,
});

test("corporate orders: source freshness and state summary stay separate", () => {
  const order = makeOrder();

  assert.equal(assessSourceFreshness("2026-09-01T12:00:00Z", referenceDate), "fresh");
  assert.equal(assessSourceFreshness("2026-08-15T12:00:00Z", referenceDate), "recent");
  assert.equal(assessSourceFreshness("2026-07-15T12:00:00Z", referenceDate), "stale");
  assert.equal(summarizeOrderFreshness(order), "stale");
  assert.match(getOrderStatusSummary(order), /Pending review/);
  assert.match(getOrderStatusSummary(order), /On hold/);
  assert.match(getOrderStatusSummary(order), /Failed/);
  assert.match(getOrderStatusSummary(order), /Degraded/);
  assert.match(getOrderStatusSummary(order), /Requested/);
  assert.equal(requiresOrderRecovery(order), true);
});

test("corporate orders: line shipment and amendment invariants prevent impossible states", () => {
  const baseLine = {
    sku: "DGH-BR50",
    name: "Dough base",
    orderedQuantity: 10,
    shippedQuantity: 4,
    unitPrice: 68.5,
  };

  assert.deepEqual(validateOrderLineInvariants(baseLine), []);
  assert.equal(getLiveLineQuantity(baseLine), 10);
  assert.equal(getRemainingLineQuantity(baseLine), 6);

  const amended = amendOrderLineQuantity(baseLine, 7, "Reduced because the unit is closed on Monday.");
  assert.equal(amended.amendedQuantity, 7);
  assert.equal(amended.shippedQuantity, 4);

  assert.throws(() => amendOrderLineQuantity(baseLine, 3), /below shipped quantity/i);
  assert.throws(() => recordOrderLineShipment(baseLine, 7), /remaining line quantity/i);

  const shipped = recordOrderLineShipment(baseLine, 2, "SHIP-002");
  assert.equal(shipped.shippedQuantity, 6);
  assert.equal(shipped.shipmentReference, "SHIP-002");
});

test("corporate orders: recovery actions call out the broken dimensions", () => {
  const order = makeOrder();
  const actions = buildOrderRecoveryActions(order);

  assert.ok(actions.some((action) => action.label === "Confirm acceptance status"));
  assert.ok(actions.some((action) => action.label === "Resolve payment failure"));
  assert.ok(actions.some((action) => action.label === "Route fulfillment recovery"));
  assert.ok(actions.some((action) => action.label === "Reconcile with the system of record"));
  assert.ok(actions.some((action) => action.label === "Track cancellation separately"));
  assert.ok(actions.some((action) => action.label === "Refresh stale source data"));
});
