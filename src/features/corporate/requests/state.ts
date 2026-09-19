import type {
  CorporateRequest,
  CorporateRequestDecisionState,
  CorporateRequestHandlingState,
} from "./types.ts";
import { summarizeFreshness } from "./freshness.ts";

type StateDefinition = {
  label: string;
  meaning: string;
  terminal: boolean;
  needsRecovery: boolean;
};

export const REQUEST_HANDLING_STATES: Record<CorporateRequestHandlingState, StateDefinition> = {
  received: {
    label: "Received",
    meaning: "The request is captured and waiting for triage.",
    terminal: false,
    needsRecovery: false,
  },
  triaged: {
    label: "Triaged",
    meaning: "The request has been routed to the right reviewer or queue.",
    terminal: false,
    needsRecovery: false,
  },
  under_review: {
    label: "Under review",
    meaning: "A human reviewer is evaluating the request against the available evidence.",
    terminal: false,
    needsRecovery: false,
  },
  awaiting_evidence: {
    label: "Awaiting evidence",
    meaning: "The reviewer is waiting for supporting material before a decision can be made.",
    terminal: false,
    needsRecovery: true,
  },
  needs_clarification: {
    label: "Needs clarification",
    meaning: "The request is blocked until the missing context is provided.",
    terminal: false,
    needsRecovery: true,
  },
  decision_pending: {
    label: "Decision pending",
    meaning: "The evidence is assembled and a decision is due next.",
    terminal: false,
    needsRecovery: false,
  },
  complete: {
    label: "Complete",
    meaning: "The request has a recorded decision and next-step conditions, if any.",
    terminal: true,
    needsRecovery: false,
  },
  withdrawn: {
    label: "Withdrawn",
    meaning: "The request was stopped by the requester or the review owner.",
    terminal: true,
    needsRecovery: false,
  },
};

export const REQUEST_DECISION_STATES: Record<CorporateRequestDecisionState, StateDefinition> = {
  pending: {
    label: "Pending",
    meaning: "No decision has been recorded yet.",
    terminal: false,
    needsRecovery: false,
  },
  approved: {
    label: "Approved",
    meaning: "The request can proceed without extra conditions.",
    terminal: true,
    needsRecovery: false,
  },
  approved_with_conditions: {
    label: "Approved with conditions",
    meaning: "The request can proceed once the recorded conditions are satisfied.",
    terminal: true,
    needsRecovery: true,
  },
  declined: {
    label: "Declined",
    meaning: "The request will not proceed in its current form.",
    terminal: true,
    needsRecovery: true,
  },
  deferred: {
    label: "Deferred",
    meaning: "The review is paused until a future revisit or changed circumstances.",
    terminal: false,
    needsRecovery: true,
  },
  withdrawn: {
    label: "Withdrawn",
    meaning: "The requester closed the request before a decision was made.",
    terminal: true,
    needsRecovery: false,
  },
};

export const getRequestHandlingState = (state: CorporateRequestHandlingState): StateDefinition =>
  REQUEST_HANDLING_STATES[state];

export const getRequestDecisionState = (state: CorporateRequestDecisionState): StateDefinition =>
  REQUEST_DECISION_STATES[state];

export const summarizeRequestFreshness = (request: CorporateRequest): ReturnType<typeof summarizeFreshness> => {
  const freshness = request.evidence.map((item) => item.freshness);
  return summarizeFreshness(freshness);
};

export const getRequestStatusSummary = (request: CorporateRequest): string => {
  const handling = getRequestHandlingState(request.handlingState);
  const decision = getRequestDecisionState(request.decisionState);
  return `${handling.label} · ${decision.label}`;
};

export const requiresRequestRecovery = (request: CorporateRequest): boolean => {
  if (getRequestHandlingState(request.handlingState).needsRecovery) return true;
  if (getRequestDecisionState(request.decisionState).needsRecovery) return true;
  return summarizeRequestFreshness(request) === "stale";
};

export const isRequestClosed = (request: CorporateRequest): boolean =>
  getRequestHandlingState(request.handlingState).terminal
  || getRequestDecisionState(request.decisionState).terminal;
