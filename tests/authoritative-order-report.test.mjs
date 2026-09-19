import assert from "node:assert/strict";
import test from "node:test";

import { buildAuthoritativeOrderReport } from "../src/features/corporate/reporting/order-report.ts";

const order = (overrides = {}) => ({
  id: "UNIT-1:ORDER-1", locationId: "UNIT-1", locationName: "Unit 1", createdAt: "2026-09-18T10:00:00Z", updatedAt: "2026-09-18T10:00:00Z",
  acceptanceState: "received", fulfillmentState: "unknown", paymentState: "unknown", integrationState: "unknown_outcome", cancellationState: "not_requested",
  lines: [{ sku: "BOX-1", name: "Box", orderedQuantity: 2, shippedQuantity: 0, unitPrice: 5 }], sourceFreshness: [], recoveryActions: [], procurementVersion: 0,
  ...overrides,
});

test("authoritative order report excludes unacknowledged value and latency", () => {
  const report = buildAuthoritativeOrderReport([order(), order({ id: "UNIT-1:ORDER-2" })]);
  assert.equal(report.submitted, 2);
  assert.equal(report.acknowledged, 0);
  assert.equal(report.acknowledgedValue, 0);
  assert.equal(report.averageAcknowledgmentHours, undefined);
});

test("authoritative order report includes only supplier-backed quantities and reconciliation", () => {
  const report = buildAuthoritativeOrderReport([order({
    supplierAcknowledgedAt: "2026-09-18T12:00:00Z", reconciledAt: "2026-09-18T13:00:00Z", reconciliationStatus: "MATCHED", procurementVersion: 2,
    integrationState: "reconciled", lines: [{ sku: "BOX-1", name: "Box", orderedQuantity: 2, acceptedQuantity: 2, shippedQuantity: 0, unitPrice: 5 }],
  }), order({ id: "UNIT-1:ORDER-2" })]);
  assert.equal(report.acknowledged, 1);
  assert.equal(report.reconciled, 1);
  assert.equal(report.matched, 1);
  assert.equal(report.acknowledgedValue, 10);
  assert.equal(report.averageAcknowledgmentHours, 2);
  assert.equal(report.coveragePercent, 50);
});
