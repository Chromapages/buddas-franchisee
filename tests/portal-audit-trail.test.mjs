import assert from "node:assert/strict";
import test from "node:test";

import {
  clearPortalAuditTrailForTesting,
  getPortalAuditTrail,
  recordPortalAudit,
  sanitizeAuditPayload,
} from "../src/features/portal/audit.ts";
import {
  defaultPortalStorage,
  InMemoryPortalStorage,
} from "../src/features/portal/storage-adapter.ts";
import {
  canTransitionOrderStatus,
  ORDER_STATUS,
} from "../src/features/portal/order-status.ts";

test.beforeEach(() => {
  clearPortalAuditTrailForTesting();
});

test("sanitizeAuditPayload thoroughly redacts sensitive keys and preserves non-sensitive context", () => {
  const input = {
    username: "operator@buddasdemo.com",
    unitId: "HNL-014",
    password: "super-secret-password-123",
    authToken: "jwt.header.payload.signature",
    sessionSecret: "shhh-secret-signing-key",
    cookie: "buddas_portal_session=abcxyz",
    creditCard: "4111-2222-3333-4444",
    nested: {
      accountApiKey: "sk_live_abcdef123456",
      actionReason: "Routine inventory adjustment",
      bearerToken: "Bearer test-token",
    },
    items: [
      { sku: "PKG-RB12", quantity: 5 },
      { authCredential: "basic-auth-creds", note: "Delivery instruction" },
    ],
  };

  const sanitized = sanitizeAuditPayload(input);

  assert.equal(sanitized.password, "[REDACTED]");
  assert.equal(sanitized.authToken, "[REDACTED]");
  assert.equal(sanitized.sessionSecret, "[REDACTED]");
  assert.equal(sanitized.cookie, "[REDACTED]");
  assert.equal(sanitized.creditCard, "[REDACTED]");
  assert.equal(sanitized.nested.accountApiKey, "[REDACTED]");
  assert.equal(sanitized.nested.bearerToken, "[REDACTED]");
  assert.equal(sanitized.items[1].authCredential, "[REDACTED]");

  // Non-sensitive operational context is preserved intact
  assert.equal(sanitized.username, "operator@buddasdemo.com");
  assert.equal(sanitized.unitId, "HNL-014");
  assert.equal(sanitized.nested.actionReason, "Routine inventory adjustment");
  assert.equal(sanitized.items[0].sku, "PKG-RB12");
  assert.equal(sanitized.items[0].quantity, 5);
  assert.equal(sanitized.items[1].note, "Delivery instruction");
});

test("supply ordering audit records actor, unit, order resource, timestamp, and outcome", async () => {
  const session = {
    sessionId: "sess-01",
    userId: "op-101",
    email: "operator@buddasdemo.com",
    role: "franchisee",
    locationId: "HNL-014",
    locationName: "La'ie Origin Grill",
    managedLocationIds: ["HNL-014"],
    expiresAt: Date.now() + 3600000,
  };

  await recordPortalAudit({
    actor: session,
    action: "SUPPLY_ORDER_ACCEPTED",
    outcome: "SUCCESS",
    unitId: session.locationId,
    resourceType: "portal_order",
    resourceId: "BD-4091",
    metadata: {
      total: 154.5,
      itemCount: 2,
      invoiceId: "INV-2026-9011",
    },
  });

  const trail = await getPortalAuditTrail();
  assert.equal(trail.length, 1);
  const event = trail[0];

  assert.equal(event.action, "SUPPLY_ORDER_ACCEPTED");
  assert.equal(event.outcome, "SUCCESS");
  assert.equal(event.actor.userId, "op-101");
  assert.equal(event.actor.email, "operator@buddasdemo.com");
  assert.equal(event.actor.role, "franchisee");
  assert.equal(event.unitId, "HNL-014");
  assert.equal(event.resourceType, "portal_order");
  assert.equal(event.resourceId, "BD-4091");
  assert.ok(event.timestamp);
  assert.equal(event.metadata?.total, 154.5);
  assert.equal(event.metadata?.itemCount, 2);
});

test("order cancellation where supported validates status transitions and audits success & denial", async () => {
  const storage = new InMemoryPortalStorage();
  const testOrder = {
    id: "BD-CANCEL-01",
    locationId: "HNL-014",
    createdAt: new Date().toISOString(),
    status: ORDER_STATUS.PROCESSING.id,
    eta: "Tomorrow",
    total: 84.0,
    invoiceId: "INV-CAN-01",
    items: [{ sku: "PKG-RB12", name: "Box", quantity: 1, price: 84.0 }],
  };

  await storage.createOrder(testOrder);

  // Status PROCESSING allows transition to CANCELLED
  assert.equal(canTransitionOrderStatus(testOrder.status, "CANCELLED"), true);

  const cancelled = await storage.cancelOrder("BD-CANCEL-01", "Overstocked duplicate");
  assert.equal(cancelled?.status, "CANCELLED");

  await recordPortalAudit({
    actor: { userId: "op-101", email: "op@buddas.test", role: "franchisee", locationId: "HNL-014" },
    action: "ORDER_CANCELLED",
    outcome: "SUCCESS",
    unitId: "HNL-014",
    resourceType: "portal_order",
    resourceId: "BD-CANCEL-01",
    metadata: {
      previousStatus: "PROCESSING",
      cancellationReason: "Overstocked duplicate",
    },
  });

  // Attempting to cancel an already DELIVERED order is rejected and audited as DENIED
  const deliveredOrder = {
    id: "BD-DELIVERED-02",
    locationId: "HNL-014",
    createdAt: new Date().toISOString(),
    status: ORDER_STATUS.DELIVERED.id,
    eta: "Delivered Yesterday",
    total: 42.0,
    invoiceId: "INV-DEL-02",
    items: [],
  };
  await storage.createOrder(deliveredOrder);

  assert.equal(canTransitionOrderStatus(deliveredOrder.status, "CANCELLED"), false);

  await recordPortalAudit({
    actor: { userId: "op-101", email: "op@buddas.test", role: "franchisee", locationId: "HNL-014" },
    action: "ORDER_CANCELLED",
    outcome: "DENIED",
    unitId: "HNL-014",
    resourceType: "portal_order",
    resourceId: "BD-DELIVERED-02",
    metadata: {
      currentStatus: "DELIVERED",
      reason: "INVALID_STATUS_TRANSITION",
    },
  });

  const trail = await getPortalAuditTrail();
  assert.equal(trail.length, 2);
  assert.equal(trail[0].outcome, "SUCCESS");
  assert.equal(trail[0].action, "ORDER_CANCELLED");
  assert.equal(trail[1].outcome, "DENIED");
  assert.equal(trail[1].metadata?.currentStatus, "DELIVERED");
});

test("unit changes maintain audit trail with previous and next unit context", async () => {
  const session = {
    sessionId: "s-1",
    userId: "admin-multi",
    email: "manager@buddas.test",
    role: "admin",
    locationId: "HNL-014",
    locationName: "La'ie Origin Grill",
    managedLocationIds: ["HNL-014", "OAH-207"],
    expiresAt: Date.now() + 3600000,
  };

  // Successful unit switch
  await recordPortalAudit({
    actor: session,
    action: "UNIT_CHANGED",
    outcome: "SUCCESS",
    unitId: "OAH-207",
    resourceType: "portal_location",
    resourceId: "OAH-207",
    metadata: {
      previousUnitId: "HNL-014",
      newUnitId: "OAH-207",
    },
  });

  // Unauthorized unit switch attempt
  await recordPortalAudit({
    actor: session,
    action: "UNIT_CHANGED",
    outcome: "DENIED",
    unitId: "UNAUTHORIZED-999",
    metadata: { reason: "LOCATION_ACCESS_DENIED" },
  });

  const trail = await getPortalAuditTrail();
  assert.equal(trail.length, 2);
  assert.equal(trail[0].outcome, "SUCCESS");
  assert.equal(trail[0].unitId, "OAH-207");
  assert.equal(trail[1].outcome, "DENIED");
  assert.equal(trail[1].unitId, "UNAUTHORIZED-999");
});

test("support-ticket actions maintain audit trail on creation and updates", async () => {
  const session = {
    userId: "user-sup-1",
    email: "operator@laie.com",
    role: "franchisee",
    locationId: "HNL-014",
  };

  await recordPortalAudit({
    actor: session,
    action: "SUPPORT_TICKET_CREATED",
    outcome: "SUCCESS",
    unitId: "HNL-014",
    resourceType: "portal_support_case",
    resourceId: "SUP-99001",
    metadata: {
      topic: "Equipment Maintenance",
      subjectSummary: "Oven gasket replacement",
    },
  });

  await recordPortalAudit({
    actor: { userId: "admin-hq", email: "support@buddas.com", role: "admin" },
    action: "SUPPORT_TICKET_UPDATED",
    outcome: "SUCCESS",
    unitId: "HNL-014",
    resourceType: "portal_support_case",
    resourceId: "SUP-99001",
    metadata: { newStatus: "Resolved" },
  });

  const trail = await getPortalAuditTrail();
  assert.equal(trail.length, 2);
  assert.equal(trail[0].action, "SUPPORT_TICKET_CREATED");
  assert.equal(trail[0].resourceId, "SUP-99001");
  assert.equal(trail[1].action, "SUPPORT_TICKET_UPDATED");
  assert.equal(trail[1].metadata?.newStatus, "Resolved");
});

test("bulletin acknowledgement maintains audit trail without modifying historical records", async () => {
  const session = {
    userId: "op-ack-1",
    email: "op@laie.com",
    role: "franchisee",
    locationId: "HNL-014",
  };

  await recordPortalAudit({
    actor: session,
    action: "BULLETIN_ACKNOWLEDGED",
    outcome: "SUCCESS",
    unitId: "HNL-014",
    resourceType: "portal_bulletin",
    resourceId: "ann-01",
  });

  const trail = await getPortalAuditTrail();
  assert.equal(trail.length, 1);
  assert.equal(trail[0].action, "BULLETIN_ACKNOWLEDGED");
  assert.equal(trail[0].resourceId, "ann-01");
  assert.equal(trail[0].actor.userId, "op-ack-1");
});

test("role and permission changes audit administrative privileges and deny unauthorized attempts", async () => {
  // Authorized admin modification
  await recordPortalAudit({
    actor: { userId: "admin-master", email: "super@buddas.test", role: "admin" },
    action: "ROLE_PERMISSION_CHANGED",
    outcome: "SUCCESS",
    resourceType: "portal_operator",
    resourceId: "target-operator-44",
    metadata: {
      newRole: "admin",
      managedUnitIds: ["HNL-014", "OAH-207"],
    },
  });

  // Denied unauthorized role change
  await recordPortalAudit({
    actor: { userId: "rogue-operator", email: "rogue@buddas.test", role: "franchisee" },
    action: "ROLE_PERMISSION_CHANGED",
    outcome: "DENIED",
    resourceType: "portal_operator",
    resourceId: "target-operator-44",
    metadata: { reason: "INSUFFICIENT_PRIVILEGE", attemptedRole: "admin" },
  });

  const trail = await getPortalAuditTrail();
  assert.equal(trail.length, 2);
  assert.equal(trail[0].outcome, "SUCCESS");
  assert.equal(trail[0].actor.role, "admin");
  assert.equal(trail[1].outcome, "DENIED");
  assert.equal(trail[1].metadata?.reason, "INSUFFICIENT_PRIVILEGE");
});

test("account changes audit profile updates and password reset requests without secrets", async () => {
  // Account profile update
  await recordPortalAudit({
    actor: { userId: "op-101", email: "op@buddas.test", role: "franchisee", locationId: "HNL-014" },
    action: "ACCOUNT_CHANGED",
    outcome: "SUCCESS",
    unitId: "HNL-014",
    resourceType: "portal_account",
    resourceId: "op-101",
    metadata: {
      updatedFields: ["displayName", "phone"],
    },
  });

  // Password reset request - verify NO passwords or tokens are stored in the audit entry
  await recordPortalAudit({
    actor: { userId: "reset-request@buddas.test", email: "reset-request@buddas.test" },
    action: "PASSWORD_RESET_REQUESTED",
    outcome: "SUCCESS",
    resourceType: "portal_account",
    resourceId: "reset-request@buddas.test",
    metadata: {
      attemptsCount: 1,
      password: "DO_NOT_LOG_THIS_PASSWORD",
      token: "secret-reset-token-123",
    },
  });

  const trail = await getPortalAuditTrail();
  assert.equal(trail.length, 2);
  assert.equal(trail[0].action, "ACCOUNT_CHANGED");
  assert.equal(trail[1].action, "PASSWORD_RESET_REQUESTED");

  // Verify the sanitization in the recorded audit event
  assert.equal(trail[1].metadata?.password, "[REDACTED]");
  assert.equal(trail[1].metadata?.token, "[REDACTED]");
  assert.equal(trail[1].metadata?.attemptsCount, 1);
});

test("audit records are operational/security infrastructure and are immutable", async () => {
  await recordPortalAudit({
    actor: { userId: "test-user", email: "test@buddas.test" },
    action: "SUPPLY_ORDER_ACCEPTED",
    outcome: "SUCCESS",
  });

  const trail = await getPortalAuditTrail();
  assert.equal(trail.length, 1);

  // Attempting to mutate returned audit records is prevented (frozen object)
  assert.throws(() => {
    trail[0].outcome = "FAILURE";
  }, TypeError);
});
