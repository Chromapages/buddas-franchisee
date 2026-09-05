import assert from "node:assert/strict";
import test from "node:test";

import { InMemoryPortalStorage } from "../src/features/portal/storage-adapter.ts";
import {
  buildSelectSupportCasesByLocationQuery,
  buildSelectSupportCaseByIdQuery,
  buildSelectSupportMessagesQuery,
  buildInsertSupportMessageQuery,
  buildUpdateSupportCaseStatusQuery,
} from "../src/features/portal/db-storage.ts";

test("Operations Support Workflow: Unit vs. User Ownership", async () => {
  const storage = new InMemoryPortalStorage();
  const cases = await storage.getSupportCasesByLocation("loc-honolulu");

  // Every ticket has a unit locationId AND an author userEmail / submittedByUserId
  for (const c of cases) {
    assert.equal(c.locationId, "loc-honolulu");
    assert.ok(c.userEmail, "Ticket must have an author email");
    assert.ok(c.submittedByUserId, "Ticket must have an author user ID");
  }

  // Cross-unit isolation: Honolulu cannot see Maui's tickets
  const mauiCases = await storage.getSupportCasesByLocation("loc-maui");
  assert.ok(mauiCases.length > 0, "Maui should have at least one ticket");
  for (const mc of mauiCases) {
    assert.equal(mc.locationId, "loc-maui");
    assert.equal(cases.some((hc) => hc.id === mc.id), false, "Honolulu list must never contain Maui tickets");
  }
});

test("Operations Support Workflow: IDOR Protection on Query and Mutation", async () => {
  const storage = new InMemoryPortalStorage();

  // Attempting to query Maui ticket with Honolulu unit ID must return null
  const crossUnitQuery = await storage.getSupportCaseById("SUP-203811", "loc-honolulu");
  assert.equal(crossUnitQuery, null, "Querying another unit's ticket must return null");

  // Querying with authorized unit ID succeeds
  const authorizedQuery = await storage.getSupportCaseById("SUP-203811", "loc-maui");
  assert.ok(authorizedQuery, "Querying with matching unit ID must succeed");
  assert.equal(authorizedQuery.id, "SUP-203811");

  // Attempting to reply to Maui ticket with Honolulu unit ID must fail
  const crossUnitReply = await storage.replySupportCase("SUP-203811", "loc-honolulu", {
    authorEmail: "honolulu.operator@buddas-test.local",
    authorRole: "OPERATOR",
    message: "Unauthorized cross-unit message attempt",
  });
  assert.equal(crossUnitReply, null, "Cross-unit reply attempt must return null");

  // Attempting to close Maui ticket with Honolulu unit ID must fail
  const crossUnitClose = await storage.closeSupportCase("SUP-203811", "loc-honolulu", "Unauthorized close");
  assert.equal(crossUnitClose, null, "Cross-unit close attempt must return null");

  // Attempting to reopen Maui ticket with Honolulu unit ID must fail
  const crossUnitReopen = await storage.reopenSupportCase("SUP-203811", "loc-honolulu", "Unauthorized reopen");
  assert.equal(crossUnitReopen, null, "Cross-unit reopen attempt must return null");
});

test("Operations Support Workflow: Complete Lifecycle (Create, View, Reply, Close, Reopen)", async () => {
  const storage = new InMemoryPortalStorage();
  const testCaseId = `SUP-TEST-${Date.now()}`;

  // 1. Create ticket
  await storage.createSupportCase({
    id: testCaseId,
    locationId: "loc-honolulu",
    userEmail: "test.operator@buddas-test.local",
    submittedByUserId: "usr-test-1",
    subject: "Proofer humidity sensor malfunction",
    topic: "Equipment & Steam Deck Oven Maintenance",
    details: "Proofer cabinet humidity reading fluctuates erratically between 40% and 95%.",
  });

  // 2. View ticket
  const ticket = await storage.getSupportCaseById(testCaseId, "loc-honolulu");
  assert.ok(ticket, "Created ticket must be retrievable");
  assert.equal(ticket.status, "Open");
  assert.equal(ticket.operatorActionRequired, false, "Initial ticket is waiting on HQ, not operator action");
  assert.ok(ticket.messages && ticket.messages.length === 1, "Initial issue should be recorded in messages history");

  // Simulate Operations Support replying with action-required
  ticket.status = "In Review";
  ticket.operatorActionRequired = true;
  ticket.messages.push({
    id: "msg-ops-1",
    caseId: testCaseId,
    locationId: "loc-honolulu",
    authorEmail: "ops@buddas.local",
    authorRole: "SUPPORT",
    authorName: "Operations Support",
    message: "Please inspect sensor wire harness behind rear panel.",
    createdAt: new Date().toISOString(),
  });

  // Verify it requires operator action now
  const pendingTicket = await storage.getSupportCaseById(testCaseId, "loc-honolulu");
  assert.equal(pendingTicket.operatorActionRequired, true);

  // 3. Operator replies to ticket
  const updatedAfterReply = await storage.replySupportCase(testCaseId, "loc-honolulu", {
    authorEmail: "test.operator@buddas-test.local",
    authorRole: "OPERATOR",
    authorName: "Test Operator",
    message: "Wire harness inspected: green ground wire was loose. Re-seated and tested.",
  });
  assert.ok(updatedAfterReply);
  assert.equal(updatedAfterReply.messages.length, 3, "Message count must now be 3");
  assert.equal(
    updatedAfterReply.operatorActionRequired,
    false,
    "Operator reply must clear operatorActionRequired flag",
  );

  // 4. Operator closes/resolves ticket
  const resolvedTicket = await storage.closeSupportCase(
    testCaseId,
    "loc-honolulu",
    "Sensor recalibrated and operating within 5% tolerance.",
  );
  assert.ok(resolvedTicket);
  assert.equal(resolvedTicket.status, "Resolved");
  assert.ok(resolvedTicket.resolvedAt, "resolvedAt timestamp must be recorded");
  assert.equal(resolvedTicket.operatorActionRequired, false);

  // 5. Operator reopens ticket
  const reopenedTicket = await storage.reopenSupportCase(
    testCaseId,
    "loc-honolulu",
    "Humidity drifted again during morning shift bake cycle.",
  );
  assert.ok(reopenedTicket);
  assert.equal(reopenedTicket.status, "Open");
  assert.ok(reopenedTicket.reopenedAt, "reopenedAt timestamp must be recorded");
  assert.equal(reopenedTicket.operatorActionRequired, false);
  const lastMessage = reopenedTicket.messages[reopenedTicket.messages.length - 1];
  assert.ok(lastMessage.message.includes("Humidity drifted again"));
});

test("Needs Your Attention Filtering: Surfaces ONLY when operator action is pending", async () => {
  const storage = new InMemoryPortalStorage();
  const cases = await storage.getSupportCasesByLocation("loc-honolulu");

  // Filter for Needs Attention (same predicate as NeedsAttentionModule)
  const needsAttentionTickets = cases.filter(
    (ticket) => ticket.status !== "Resolved" && ticket.operatorActionRequired === true,
  );

  // Should include SUP-102941 (action required)
  assert.ok(needsAttentionTickets.some((t) => t.id === "SUP-102941"), "Action-required ticket must be surfaced");

  // Must NOT include SUP-102942 (Open, but waiting on operations queue)
  assert.equal(
    needsAttentionTickets.some((t) => t.id === "SUP-102942"),
    false,
    "Open ticket waiting on operations must NOT be surfaced in operator's Needs Attention",
  );

  // Must NOT include SUP-102940 (Resolved)
  assert.equal(
    needsAttentionTickets.some((t) => t.id === "SUP-102940"),
    false,
    "Resolved ticket must NOT be surfaced in Needs Attention",
  );
});

test("SQL Query Builders: Tenant Isolation Enforcement", () => {
  // Query builders must parameterize and filter by locationId
  const byLoc = buildSelectSupportCasesByLocationQuery("loc-honolulu");
  assert.ok(byLoc.text.includes("location_id = $1"));
  assert.deepEqual(byLoc.values, ["loc-honolulu"]);

  const byId = buildSelectSupportCaseByIdQuery("SUP-102941", "loc-honolulu");
  assert.ok(byId.text.includes("case_id = $1 AND c.location_id = $2"));
  assert.deepEqual(byId.values, ["SUP-102941", "loc-honolulu"]);

  const msgSelect = buildSelectSupportMessagesQuery("SUP-102941", "loc-honolulu");
  assert.ok(msgSelect.text.includes("case_id = $1 AND location_id = $2"));
  assert.deepEqual(msgSelect.values, ["SUP-102941", "loc-honolulu"]);

  const msgInsert = buildInsertSupportMessageQuery(
    "msg-1",
    "SUP-102941",
    "loc-honolulu",
    "op@buddas.local",
    "OPERATOR",
    "Operator",
    "Test message",
  );
  assert.ok(msgInsert.text.includes("location_id"));
  assert.ok(msgInsert.values.includes("loc-honolulu"));

  const statusUpdate = buildUpdateSupportCaseStatusQuery("SUP-102941", "Resolved", "loc-honolulu");
  assert.ok(statusUpdate.text.includes("location_id = $3"));
  assert.deepEqual(statusUpdate.values, ["SUP-102941", "Resolved", "loc-honolulu"]);
});
