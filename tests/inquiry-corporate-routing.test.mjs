import assert from "node:assert/strict";
import test from "node:test";

import { InMemoryInquiryStorage } from "../src/features/inquiry/storage-adapter.ts";

const inquiry = {
  id: "INQ-TEST-001",
  submittedAt: "2026-09-07T12:00:00.000Z",
  classification: "GENERAL_INQUIRY",
  deliveryStatus: "PENDING",
  version: 1,
  routing: { status: "NEEDS_REVIEW", teamId: "franchise-development-intake", ruleId: "test", ruleVersion: "1", reason: "Test", routedAt: "2026-09-07T12:00:00.000Z", history: [] },
  workflow: { status: "NEW", decision: "PENDING", nextAction: "Review routing", updatedAt: "2026-09-07T12:00:00.000Z", history: [{ id: "submitted", action: "SUBMITTED", actorId: "candidate", actorName: "Candidate", occurredAt: "2026-09-07T12:00:00.000Z" }] },
  payload: { marketInterest: "Phoenix, AZ", cityState: "Los Angeles, CA" },
  attempts: 1,
};

test("inquiry workflow changes are versioned and do not overwrite a newer review", async () => {
  const storage = new InMemoryInquiryStorage();
  await storage.save(inquiry);
  const claimed = await storage.updateWorkflow(inquiry.id, 1, { ...inquiry.workflow, status: "ASSIGNED", assignedToUserId: "staff-1", assignedToName: "Franchise Development", nextAction: "Contact candidate", updatedAt: "2026-09-07T12:01:00.000Z", history: [...inquiry.workflow.history, { id: "claimed", action: "CLAIMED", actorId: "staff-1", actorName: "Franchise Development", occurredAt: "2026-09-07T12:01:00.000Z" }] });
  assert.equal(claimed?.version, 2);
  assert.equal(claimed?.workflow.history.length, 2);
  const stale = await storage.updateWorkflow(inquiry.id, 1, { ...inquiry.workflow, status: "CLOSED", decision: "NOT_PROCEEDING", nextAction: "Closed", updatedAt: "2026-09-07T12:02:00.000Z", history: inquiry.workflow.history });
  assert.equal(stale, null);
});
