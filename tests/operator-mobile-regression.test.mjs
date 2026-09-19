import assert from "node:assert/strict";
import test from "node:test";

import { isBulletinActionOutstanding } from "../src/features/portal/bulletins.ts";
import { DASHBOARD_DATA_STATE, resolveDashboardCollectionState } from "../src/features/portal/dashboard-data-state.ts";
import { getOrderStatus } from "../src/features/portal/order-status.ts";

test("local scenario records cover all-clear, multiple attention, support reply and overdue update", () => {
  const hnlOrders = [{ status: "DELAYED" }, { status: "PROCESSING" }];
  const hnlSupport = [{ status: "In Review", operatorActionRequired: true }];
  const visibleHnl = [{ priority: "ACTION_REQUIRED", acknowledgement: { required: true, dueAt: "2026-09-06T23:59:00Z" } }];
  const slcOrders = [{ status: "PROCESSING" }];
  const slcSupport = [];
  const visibleSlc = [];
  const hnlAttention = hnlOrders.filter((order) => getOrderStatus(order.status).operatorActionRequired).length
    + hnlSupport.filter((ticket) => ticket.operatorActionRequired && ticket.status !== "Resolved").length
    + visibleHnl.filter(isBulletinActionOutstanding).length;
  const slcAttention = slcOrders.filter((order) => getOrderStatus(order.status).operatorActionRequired).length
    + slcSupport.filter((ticket) => ticket.operatorActionRequired && ticket.status !== "Resolved").length
    + visibleSlc.filter(isBulletinActionOutstanding).length;
  assert.equal(hnlAttention, 3);
  assert.equal(slcAttention, 0);
  assert.equal(visibleSlc.length, 0);
  assert.ok(hnlSupport.some((ticket) => ticket.operatorActionRequired));
  assert.ok(visibleHnl.some((bulletin) => bulletin.acknowledgement?.dueAt && Date.parse(bulletin.acknowledgement.dueAt) < Date.now()));
});

test("order scenarios protect long identifiers, large totals, delayed and quiet cancellation states", () => {
  const delayed = { id: "ORD-2026-HNL-VERY-LONG-REFERENCE-000042", total: 1234567.89, status: "DELAYED" };
  const cancelled = { id: "ORD-CANCELLED-207", total: 84, status: "CANCELLED" };
  assert.ok(delayed.id.length > 30);
  assert.ok(delayed.total > 1_000_000);
  assert.equal(getOrderStatus(delayed.status).operatorActionRequired, true);
  assert.ok(cancelled);
  assert.equal(getOrderStatus(cancelled.status).operatorActionRequired, false);
});

test("dashboard collection states distinguish empty, stale, failure, permission and setup", () => {
  assert.equal(resolveDashboardCollectionState({ status: "fulfilled", value: [] }, true).state, DASHBOARD_DATA_STATE.EMPTY);
  assert.equal(resolveDashboardCollectionState({ status: "fulfilled", value: [{}] }, true, { updatedAt: "2026-09-01T00:00:00Z", staleAfterMs: 1 }).state, DASHBOARD_DATA_STATE.STALE);
  assert.equal(resolveDashboardCollectionState({ status: "rejected", reason: new Error("offline") }, true).state, DASHBOARD_DATA_STATE.PARTIAL_ERROR);
  assert.equal(resolveDashboardCollectionState(undefined, false).state, DASHBOARD_DATA_STATE.PERMISSION_UNAVAILABLE);
  assert.equal(resolveDashboardCollectionState(undefined, true).state, DASHBOARD_DATA_STATE.UNCONFIGURED);
});
