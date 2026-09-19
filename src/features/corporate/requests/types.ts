export type CorporateRequestScopeType = "location" | "region" | "multi-location" | "enterprise";

export type CorporateRequestHandlingState =
  | "received"
  | "triaged"
  | "under_review"
  | "awaiting_evidence"
  | "needs_clarification"
  | "decision_pending"
  | "complete"
  | "withdrawn";

export type CorporateRequestDecisionState =
  | "pending"
  | "approved"
  | "approved_with_conditions"
  | "declined"
  | "deferred"
  | "withdrawn";

export type CorporateSourceFreshness = "fresh" | "recent" | "stale" | "unknown";

export type CorporateRequestEvidence = {
  label: string;
  source: string;
  observedAt?: string;
  freshness: CorporateSourceFreshness;
  note?: string;
};

export type CorporateRequestCondition = {
  label: string;
  satisfied: boolean;
  owner?: string;
  dueAt?: string;
};

export type CorporateRequestRecoveryAction = {
  label: string;
  description: string;
};

export type CorporateRequest = {
  id: string;
  sourceRequestId?: string;
  organizationId?: string;
  locationId: string;
  locationName: string;
  scopeType: CorporateRequestScopeType;
  scopeLabel: string;
  title: string;
  summary: string;
  submittedAt: string;
  updatedAt: string;
  handlingState: CorporateRequestHandlingState;
  decisionState: CorporateRequestDecisionState;
  evidence: CorporateRequestEvidence[];
  conditions: CorporateRequestCondition[];
  recoveryActions: CorporateRequestRecoveryAction[];
  decisionReason?: string;
  reviewerNotes?: string;
  locationIds?: readonly string[];
};
