import type { CorporateRequest } from "./types.ts";
import { describeSourceFreshness } from "./freshness.ts";
import { getRequestDecisionState, getRequestHandlingState, requiresRequestRecovery, summarizeRequestFreshness } from "./state.ts";

export type RequestReviewChecklistItem = {
  label: string;
  status: "complete" | "attention" | "pending";
  detail: string;
};

export const buildRequestReviewChecklist = (request: CorporateRequest): RequestReviewChecklistItem[] => {
  const handling = getRequestHandlingState(request.handlingState);
  const decision = getRequestDecisionState(request.decisionState);
  const freshness = summarizeRequestFreshness(request);
  const staleEvidence = request.evidence.find((item) => item.freshness === "stale");
  const unmetConditions = request.conditions.filter((condition) => !condition.satisfied);

  return [
    {
      label: "Scope",
      status: request.scopeLabel.trim() ? "complete" : "pending",
      detail: request.scopeLabel || "No scope label provided.",
    },
    {
      label: "Handling",
      status: handling.terminal ? "complete" : "attention",
      detail: handling.meaning,
    },
    {
      label: "Decision",
      status: decision.terminal ? "complete" : "pending",
      detail: decision.meaning,
    },
    {
      label: "Evidence freshness",
      status: freshness === "stale" ? "attention" : freshness === "unknown" ? "pending" : "complete",
      detail: staleEvidence
        ? `${staleEvidence.label} is stale and should be refreshed.`
        : describeSourceFreshness(freshness),
    },
    {
      label: "Conditions",
      status: unmetConditions.length ? "attention" : "complete",
      detail: unmetConditions.length
        ? `${unmetConditions.length} condition${unmetConditions.length === 1 ? "" : "s"} still need attention.`
        : "All recorded conditions are satisfied.",
    },
    {
      label: "Recovery",
      status: requiresRequestRecovery(request) ? "attention" : "complete",
      detail: request.recoveryActions.length
        ? "Request recovery actions are recorded."
        : "No recovery action is currently required.",
    },
  ];
};

export const getRequestRecoveryLabels = (request: CorporateRequest): string[] =>
  request.recoveryActions.map((action) => action.label);
