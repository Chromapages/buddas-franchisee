import assert from "node:assert/strict";
import test from "node:test";
import { assessSourceFreshness } from "../src/features/corporate/requests/freshness.ts";
import {
  buildRequestReviewChecklist,
  getRequestRecoveryLabels,
} from "../src/features/corporate/requests/review.ts";
import {
  getRequestStatusSummary,
  requiresRequestRecovery,
  summarizeRequestFreshness,
  isRequestClosed,
} from "../src/features/corporate/requests/state.ts";

const referenceDate = new Date("2026-09-06T12:00:00Z");

const makeRequest = (overrides = {}) => ({
  id: "REQ-1001",
  locationId: "HNL-014",
  locationName: "La'ie Origin Grill",
  scopeType: "multi-location",
  scopeLabel: "Hawaii market group",
  title: "Add multi-unit weekend service review",
  summary: "Request a scoped review of weekend coverage across the Hawaii market group.",
  submittedAt: "2026-09-01T10:00:00Z",
  updatedAt: "2026-09-06T10:00:00Z",
  handlingState: "awaiting_evidence",
  decisionState: "approved_with_conditions",
  evidence: [
    {
      label: "Traffic study",
      source: "Regional operating packet",
      observedAt: "2026-07-15T00:00:00Z",
      freshness: "stale",
      note: "Needs refresh before final decision.",
    },
  ],
  conditions: [
    {
      label: "Staffing plan reviewed",
      satisfied: false,
      owner: "Operations",
      dueAt: "2026-09-10",
    },
  ],
  recoveryActions: [
    {
      label: "Refresh the traffic study",
      description: "Collect a current source before closing the review.",
    },
  ],
  ...overrides,
});

test("corporate requests: source freshness classifies evidence truthfully", () => {
  assert.equal(
    assessSourceFreshness("2026-09-01T12:00:00Z", referenceDate),
    "fresh",
  );
  assert.equal(
    assessSourceFreshness("2026-08-20T12:00:00Z", referenceDate),
    "recent",
  );
  assert.equal(
    assessSourceFreshness("2026-07-20T12:00:00Z", referenceDate),
    "stale",
  );
  assert.equal(assessSourceFreshness(undefined, referenceDate), "unknown");
});

test("corporate requests: review checklist exposes evidence, conditions, and recovery", () => {
  const request = makeRequest();
  const checklist = buildRequestReviewChecklist(request);

  assert.equal(getRequestStatusSummary(request), "Awaiting evidence · Approved with conditions");
  assert.equal(summarizeRequestFreshness(request), "stale");
  assert.equal(requiresRequestRecovery(request), true);
  assert.equal(isRequestClosed(request), true);
  assert.deepEqual(getRequestRecoveryLabels(request), ["Refresh the traffic study"]);

  const evidenceRow = checklist.find((item) => item.label === "Evidence freshness");
  const conditionsRow = checklist.find((item) => item.label === "Conditions");
  const recoveryRow = checklist.find((item) => item.label === "Recovery");

  assert.equal(evidenceRow?.status, "attention");
  assert.equal(conditionsRow?.status, "attention");
  assert.equal(recoveryRow?.status, "attention");
});
