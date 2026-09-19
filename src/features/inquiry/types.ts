export type InquiryClassification =
  | "QUALIFIED_CANDIDATE"
  | "FUTURE_MARKET"
  | "RESTRICTED_TERRITORY"
  | "UNQUALIFIED_EXPERIENCE"
  | "BROKER_REFERRAL"
  | "GENERAL_INQUIRY";

export type InquiryDeliveryStatus =
  | "PENDING"
  | "DELIVERED"
  | "RETRYING"
  | "FAILED";

export type InquiryRoutingStatus = "ROUTED" | "NEEDS_REVIEW" | "UNROUTABLE";
export type InquiryWorkflowStatus = "NEW" | "ASSIGNED" | "CONTACTING" | "ENGAGED" | "ON_HOLD" | "CLOSED";
export type InquiryDecisionStatus = "PENDING" | "ADVANCE" | "HOLD" | "NOT_PROCEEDING";

/** A durable, append-only explanation of an inquiry review action. */
export type InquiryActivity = {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  occurredAt: string;
  note?: string;
};

export type InquiryRouting = {
  status: InquiryRoutingStatus;
  regionId?: string;
  teamId: string;
  ruleId: string;
  ruleVersion: string;
  reason: string;
  routedAt: string;
  overriddenByUserId?: string;
  overrideReason?: string;
  history: InquiryActivity[];
};

export type InquiryWorkflow = {
  status: InquiryWorkflowStatus;
  decision: InquiryDecisionStatus;
  decisionNote?: string;
  decidedByUserId?: string;
  decidedByName?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  nextAction: string;
  followUpAt?: string;
  updatedAt: string;
  history: InquiryActivity[];
};

export type InquiryAttribution = Partial<{
  sourcePage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
}>;

export type StoredInquiry = {
  id: string;
  submittedAt: string;
  classification: InquiryClassification;
  deliveryStatus: InquiryDeliveryStatus;
  payload: Record<string, unknown>;
  attempts: number;
  version: number;
  routing: InquiryRouting;
  workflow: InquiryWorkflow;
  lastError?: string;
  brokerId?: string;
  attribution?: InquiryAttribution;
};

export interface IInquiryStorage {
  save(inquiry: StoredInquiry): Promise<void>;
  updateStatus(
    id: string,
    status: InquiryDeliveryStatus,
    error?: string,
  ): Promise<void>;
  updateRouting(id: string, expectedVersion: number, routing: InquiryRouting): Promise<StoredInquiry | null>;
  updateWorkflow(id: string, expectedVersion: number, workflow: InquiryWorkflow): Promise<StoredInquiry | null>;
  getById(id: string): Promise<StoredInquiry | null>;
  getAll(): Promise<StoredInquiry[]>;
}
